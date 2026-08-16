import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CartStatus,
  FulfillmentType,
  OrderChannel,
  OrderStatus,
  PaymentGatewayMethod,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  StoreStatus,
} from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { DomainEvents } from '../../shared/events/domain-events.const';
import { EventBusService } from '../../shared/events/event-bus.service';
import { nextInvoiceNumber, nextOrderNumber, nextPosOrderNumber } from '../../common/utils/db-sequence.util';
import { checkIdempotencyKey, setIdempotencyKey } from '../../common/utils/idempotency.util';
import { CANCEL_WINDOW_SECONDS } from './order.constants';
import { OffersService } from '../offers/offers.service';
import { InventoryService } from '../inventory/inventory.service';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import { CreatePosOrderDto } from './dto/create-pos-order.dto';
import {
  CreateDeliveryStaffDto,
  DispatchOrderDto,
  ListStoreOrdersQueryDto,
  RejectOrderDto,
  UpdateDeliveryStaffDto,
} from './dto/store-orders.dto';
import { OrderSseService } from './order-sse.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly inventoryService: InventoryService,
    private readonly offersService: OffersService,
    private readonly orderSseService: OrderSseService,
  ) {}

  // ── Store Orders Management ───────────────────────────────────────────────

  async listOrdersForStore(storeId: string, query: ListStoreOrdersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.OrderWhereInput = {
      storeId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.channel ? { channel: query.channel } : {}),
      ...(query.fulfillmentType ? { fulfillmentType: query.fulfillmentType } : {}),
      ...(query.fromDate || query.toDate
        ? {
            createdAt: {
              ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
              ...(query.toDate ? { lte: new Date(query.toDate) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              productVariant: {
                select: { id: true, variantName: true, sku: true },
              },
            },
          },
          customerContact: true,
          deliveryStaff: true,
          salesInvoice: {
            select: { id: true, invoiceNumber: true, totalAmount: true, issuedAt: true },
          },
          payments: {
            select: { id: true, amount: true, status: true, method: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getOrderForStore(storeId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, storeId },
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: { select: { id: true, name: true, images: true } } },
            },
          },
        },
        customerContact: true,
        deliveryStaff: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          include: { changedBy: { select: { id: true, name: true } } },
        },
        payments: true,
        salesInvoice: true,
        appliedOffers: { include: { offer: { select: { id: true, title: true, offerType: true } } } },
        deliveryAssignment: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return order;
  }

  // ── Order State Machine Transitions ───────────────────────────────────────

  async acceptOrder(storeId: string, orderId: string, actorUserId: string) {
    const order = await this.getOrderForStore(storeId, orderId);

    if (order.status !== OrderStatus.PLACED) {
      throw new BadRequestException(
        `Cannot accept order in status ${order.status}. Must be PLACED.`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.ACCEPTED, acceptedAt: new Date(), updatedBy: actorUserId },
    });

    await this.recordStatusChange(orderId, OrderStatus.PLACED, OrderStatus.ACCEPTED, actorUserId);
    this.eventBus.emit(DomainEvents.ORDER_ACCEPTED, { orderId, storeId });
    return updated;
  }

  async rejectOrder(storeId: string, orderId: string, dto: RejectOrderDto, actorUserId: string) {
    const fromStatus = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, storeId },
        include: { items: true, payments: true },
      });
      if (!order) throw new NotFoundException(`Order ${orderId} not found`);

      if (order.status !== OrderStatus.PLACED && order.status !== OrderStatus.ACCEPTED) {
        throw new BadRequestException(
          `Cannot reject order in status ${order.status}. Only PLACED or ACCEPTED.`,
        );
      }

      const variantIds = order.items.map((i) => i.productVariantId);
      if (variantIds.length) {
        await tx.$queryRaw`
          SELECT id FROM "inventory"
          WHERE "product_variant_id" = ANY(${variantIds}::uuid[])
          FOR UPDATE`;
      }

      for (const item of order.items) {
        await this.inventoryService.releaseReservedStock(
          item.productVariantId,
          item.quantity,
          actorUserId,
          tx,
        );
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.REJECTED, cancelledReason: dto.reason, updatedBy: actorUserId },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: OrderStatus.REJECTED,
          changedByUserId: actorUserId,
          reason: dto.reason,
        },
      });

      // Refund if payment already SUCCESS (online method)
      const payment = order.payments[0];
      if (payment?.status === PaymentStatus.SUCCESS && ['UPI', 'CARD'].includes(payment.method as string)) {
        await tx.refund.create({
          data: { orderId, amount: payment.amount, reason: dto.reason, initiatedBy: actorUserId, status: 'INITIATED' },
        });
      }

      return order.status;
    });

    this.eventBus.emit(DomainEvents.ORDER_REJECTED, { orderId, storeId, reason: dto.reason });
    return { orderId, status: OrderStatus.REJECTED };
  }

  async cancelOrder(
    storeId: string,
    orderId: string,
    dto: { reason: string },
    actorUserId: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, storeId },
        include: { items: true, payments: true },
      });
      if (!order) throw new NotFoundException(`Order ${orderId} not found`);

      const terminalStatuses: OrderStatus[] = [
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED,
        OrderStatus.REJECTED,
      ];
      if (terminalStatuses.includes(order.status)) {
        throw new BadRequestException(
          `Cannot cancel order in terminal status ${order.status}.`,
        );
      }

      // FOR UPDATE — lock inventory before releasing
      const variantIds = order.items.map((i) => i.productVariantId);
      if (variantIds.length) {
        await tx.$queryRaw`
          SELECT id FROM "inventory"
          WHERE "product_variant_id" = ANY(${variantIds}::uuid[])
          FOR UPDATE`;
      }

      // Release reserved stock (APP channel orders only — POS has no reservations)
      if (order.channel === OrderChannel.APP) {
        for (const item of order.items) {
          await this.inventoryService.releaseReservedStock(
            item.productVariantId,
            item.quantity,
            actorUserId,
            tx,
          );
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED, cancelledReason: dto.reason, updatedBy: actorUserId },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: OrderStatus.CANCELLED,
          changedByUserId: actorUserId,
          reason: dto.reason,
        },
      });

      // Refund only if payment was SUCCESS and online method
      const payment = order.payments[0];
      if (
        payment?.status === PaymentStatus.SUCCESS &&
        ['UPI', 'CARD'].includes(payment.method as string)
      ) {
        await tx.refund.create({
          data: { orderId, amount: payment.amount, reason: dto.reason, initiatedBy: actorUserId, status: 'INITIATED' },
        });
      }
      // PAY_AT_PICKUP INITIATED → no refund row (money was never collected)
    });

    this.eventBus.emit(DomainEvents.ORDER_CANCELLED, { orderId, storeId, reason: dto.reason });
    return { orderId, status: OrderStatus.CANCELLED };
  }

  async prepareOrder(storeId: string, orderId: string, actorUserId: string) {
    const order = await this.getOrderForStore(storeId, orderId);

    if (order.status !== OrderStatus.ACCEPTED) {
      throw new BadRequestException(
        `Cannot start preparation for order in status ${order.status}. Must be ACCEPTED.`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PREPARING, updatedBy: actorUserId },
    });

    await this.recordStatusChange(orderId, OrderStatus.ACCEPTED, OrderStatus.PREPARING, actorUserId);
    this.eventBus.emit(DomainEvents.ORDER_PREPARING, { orderId, storeId });
    return updated;
  }

  async markReady(storeId: string, orderId: string, actorUserId: string) {
    const order = await this.getOrderForStore(storeId, orderId);

    if (order.status !== OrderStatus.PREPARING) {
      throw new BadRequestException(
        `Cannot mark order ready in status ${order.status}. Must be PREPARING.`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.READY_FOR_PICKUP, readyAt: new Date(), updatedBy: actorUserId },
    });

    await this.recordStatusChange(orderId, OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP, actorUserId);
    this.eventBus.emit(DomainEvents.ORDER_READY, { orderId, storeId });
    return updated;
  }

  async dispatchOrder(storeId: string, orderId: string, dto: DispatchOrderDto, actorUserId: string) {
    const order = await this.getOrderForStore(storeId, orderId);

    if (
      order.status !== OrderStatus.PREPARING &&
      order.status !== OrderStatus.READY_FOR_PICKUP
    ) {
      throw new BadRequestException(
        `Cannot dispatch order in status ${order.status}. Must be PREPARING or READY_FOR_PICKUP.`,
      );
    }

    if (dto.deliveredByStaffId) {
      const staff = await this.prisma.storeDeliveryStaff.findFirst({
        where: { id: dto.deliveredByStaffId, storeId, deletedAt: null },
      });
      if (!staff) throw new NotFoundException(`Delivery staff ${dto.deliveredByStaffId} not found`);
    }

    const fromStatus = order.status;
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.OUT_FOR_DELIVERY,
        deliveredByStaffId: dto.deliveredByStaffId ?? order.deliveredByStaffId,
        updatedBy: actorUserId,
      },
    });

    await this.recordStatusChange(orderId, fromStatus, OrderStatus.OUT_FOR_DELIVERY, actorUserId);
    this.eventBus.emit(DomainEvents.ORDER_DISPATCHED, { orderId, storeId, staffId: dto.deliveredByStaffId });
    return updated;
  }

  async completeOrder(storeId: string, orderId: string, actorUserId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, storeId },
        include: { items: true, payments: true },
      });
      if (!order) throw new NotFoundException(`Order ${orderId} not found`);

      if (
        order.status !== OrderStatus.READY_FOR_PICKUP &&
        order.status !== OrderStatus.OUT_FOR_DELIVERY
      ) {
        throw new BadRequestException(
          `Cannot complete order in status ${order.status}. Must be READY_FOR_PICKUP or OUT_FOR_DELIVERY.`,
        );
      }

      // FOR UPDATE — lock inventory before committing stock
      const variantIds = order.items.map((i) => i.productVariantId);
      if (variantIds.length) {
        await tx.$queryRaw`
          SELECT id FROM "inventory"
          WHERE "product_variant_id" = ANY(${variantIds}::uuid[])
          FOR UPDATE`;
      }

      // Commit reserved stock for APP channel orders
      if (order.channel === OrderChannel.APP) {
        for (const item of order.items) {
          await this.inventoryService.commitReservedStock(
            item.productVariantId,
            item.quantity,
            order.id,
            actorUserId,
            tx,
          );
        }
      }

      const fromStatus = order.status;
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.COMPLETED, completedAt: new Date(), updatedBy: actorUserId },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus,
          toStatus: OrderStatus.COMPLETED,
          changedByUserId: actorUserId,
        },
      });

      // PAY_AT_PICKUP: customer just paid at counter — mark SUCCESS now
      const payment = order.payments[0];
      if (payment?.method === PaymentGatewayMethod.COD) {
        // PAY_AT_PICKUP maps to COD in gateway method
        await tx.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.SUCCESS } });
      }
      // UPI/CARD: already SUCCESS from confirmPayment() — no update needed

      // Auto-generate SalesInvoice if not already present
      const existingInvoice = await tx.salesInvoice.findFirst({ where: { orderId } });
      if (!existingInvoice) {
        const invoiceNumber = await nextInvoiceNumber(tx);
        const gstAmount = order.items.reduce((sum, item) => {
          const price = Number(item.unitPriceSnapshot);
          const gstRate = Number((item as any).gstRatePercentSnapshot ?? 0);
          return sum + (price * item.quantity * gstRate) / 100;
        }, 0);

        await tx.salesInvoice.create({
          data: {
            orderId,
            invoiceNumber,
            gstAmount: new Prisma.Decimal(gstAmount),
            totalAmount: order.totalAmount,
            pdfUrl: null, // TODO: Phase 2 — async PDF generation
            createdBy: actorUserId,
          },
        });
      }

      return { orderId, status: OrderStatus.COMPLETED };
    });

    this.eventBus.emit(DomainEvents.ORDER_COMPLETED, { orderId, storeId });
    return result;
  }

  // ── Online Customer Checkout ───────────────────────────────────────────────

  async checkout(dto: CheckoutOrderDto, customerUserId: string, idempotencyKey: string) {
    // Pre-tx idempotency check (outside tx to avoid lock contention)
    await checkIdempotencyKey(this.prisma, idempotencyKey);

    // Pre-tx: validate store exists and is accepting orders
    const store = await this.prisma.store.findFirst({
      where: { id: dto.storeId, deletedAt: null },
      include: {
        operatingHours: { where: { deletedAt: null } },
        hourExceptions: { where: { deletedAt: null } },
      },
    });
    if (!store) throw new NotFoundException(`Store ${dto.storeId} not found`);
    if (store.status !== StoreStatus.LIVE) {
      throw new BadRequestException(`Store is not accepting orders (status: ${store.status})`);
    }
    if (store.isTemporarilyPaused) {
      throw new BadRequestException(
        `Store is temporarily paused: ${store.pauseReason || 'Not taking orders right now'}`,
      );
    }

    // Verify if store is open based on hours/exceptions
    const now = new Date();
    const istTimeStr = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
    const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const currentDay = istDate.getDay(); 

    const todayStr = now.toISOString().slice(0, 10);
    const todayException = store.hourExceptions.find(
      (e) => e.exceptionDate.toISOString().slice(0, 10) === todayStr,
    );

    let isStoreClosed = false;
    if (todayException) {
      if (todayException.isClosed) {
        isStoreClosed = true;
      } else if (todayException.openTime && todayException.closeTime) {
        if (istTimeStr < todayException.openTime || istTimeStr > todayException.closeTime) {
          isStoreClosed = true;
        }
      }
    } else {
      const daySchedule = store.operatingHours.find((h) => h.dayOfWeek === currentDay);
      if (!daySchedule || daySchedule.isClosed) {
        isStoreClosed = true;
      } else if (daySchedule.openTime && daySchedule.closeTime) {
        if (istTimeStr < daySchedule.openTime || istTimeStr > daySchedule.closeTime) {
          isStoreClosed = true;
        }
      }
    }

    if (isStoreClosed) {
      throw new BadRequestException('Store is currently closed and not accepting orders.');
    }

    // Pre-tx: load variants to validate ownership + get product/GST info
    const variantIds = dto.items.map((i) => i.productVariantId);
    const variants = await this.prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
        deletedAt: null,
        isActive: true,
        product: { storeId: dto.storeId, deletedAt: null, isActive: true },
      },
      include: { product: true },
    });

    if (variants.length !== variantIds.length) {
      throw new BadRequestException(
        'One or more product variants do not exist, are inactive, or do not belong to this store',
      );
    }
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // Pre-tx: evaluate offers (stub returns zero discount in Phase 1)
    const cartItemsForOffers = dto.items.map((i) => {
      const v = variantMap.get(i.productVariantId)!;
      return {
        productVariantId: i.productVariantId,
        productId: v.productId,
        categoryId: v.product.categoryId,
        quantity: i.quantity,
        unitPrice: v.priceOverride ?? v.product.basePrice,
      };
    });
    const { appliedOffer, lineItemDiscounts, totalDiscount } =
      await this.offersService.evaluateOffersForCart(dto.storeId, cartItemsForOffers, 'APP');

    const result = await this.prisma.$transaction(async (tx) => {
      // FOR UPDATE — lock inventory rows before any reads
      await tx.$queryRaw`
        SELECT id FROM "inventory"
        WHERE "product_variant_id" = ANY(${variantIds}::uuid[])
        FOR UPDATE`;

      // Validate available stock inside the transaction
      for (const item of dto.items) {
        const inv = await tx.inventory.findFirst({
          where: { productVariantId: item.productVariantId },
        });
        const available = (inv?.quantity ?? 0) - (inv?.reservedQuantity ?? 0);
        if (available < item.quantity) {
          throw new ConflictException({
            code: 'INSUFFICIENT_STOCK',
            variantId: item.productVariantId,
            availableQty: available,
            requestedQty: item.quantity,
          });
        }
      }

      // Build order items with snapshots
      let subtotal = 0;
      const orderItemsData = dto.items.map((item) => {
        const v = variantMap.get(item.productVariantId)!;
        const unitPrice = v.priceOverride
          ? Number(v.priceOverride)
          : Number(v.product.basePrice);
        const gstRate = Number(v.product.gstRatePercent ?? 0);
        const lineTotal = unitPrice * item.quantity;
        const lineDiscount =
          lineItemDiscounts.find((d) => d.variantId === item.productVariantId)?.discountAmount ?? 0;
        subtotal += lineTotal;

        return {
          productVariantId: item.productVariantId,
          productNameSnapshot: `${v.product.name} (${v.variantName})`,
          quantity: item.quantity,
          unitPriceSnapshot: new Prisma.Decimal(unitPrice),
          lineTotal: new Prisma.Decimal(lineTotal),
          gstRatePercentSnapshot: new Prisma.Decimal(gstRate),
          discountAmount: new Prisma.Decimal(lineDiscount),
        };
      });

      const deliveryFee =
        dto.fulfillmentType === FulfillmentType.STORE_DELIVERY
          ? Number(store.deliveryFee ?? 0)
          : 0;

      const totalAmount = subtotal + deliveryFee - totalDiscount;
      const orderNumber = await nextOrderNumber(tx);

      const order = await tx.order.create({
        data: {
          orderNumber,
          channel: OrderChannel.APP,
          customerId: customerUserId,
          storeId: dto.storeId,
          cityId: store.cityId,
          zoneId: store.zoneId ?? null,
          fulfillmentType: dto.fulfillmentType,
          status: OrderStatus.PLACED,
          subtotal: new Prisma.Decimal(subtotal),
          deliveryFee: new Prisma.Decimal(deliveryFee),
          discountAmount: new Prisma.Decimal(totalDiscount),
          commissionPercentApplied: new Prisma.Decimal(0), // Phase 2
          commissionAmount: new Prisma.Decimal(0),         // Phase 2
          totalAmount: new Prisma.Decimal(totalAmount),
          paymentMethod: dto.paymentMethod,
          storeNotes: dto.storeNotes ?? null,
          placedAt: new Date(),
          createdBy: customerUserId,
          items: { create: orderItemsData },
          customerContact: {
            create: {
              name: dto.customerName,
              phone: dto.customerPhone,
              deliveryAddress: dto.deliveryAddress ?? null,
              createdBy: customerUserId,
            },
          },
          statusHistory: {
            create: {
              fromStatus: 'NONE',
              toStatus: OrderStatus.PLACED,
              changedByUserId: customerUserId,
              reason: 'Customer online order placement',
            },
          },
        },
      });

      // Snapshot the applied offer
      if (appliedOffer) {
        await tx.appliedOffer.create({
          data: {
            orderId: order.id,
            offerId: appliedOffer.offerId,
            discountAmount: new Prisma.Decimal(appliedOffer.discountAmount),
            rewardDetails: appliedOffer.snapshot as any,
          },
        });
      }

      // Create payment — ALL methods INITIATED at checkout
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: new Prisma.Decimal(totalAmount),
          status: PaymentStatus.INITIATED,
          method: this.mapPaymentMethodToGateway(dto.paymentMethod),
        },
      });

      // Reserve stock — inside tx so it's atomic with order creation
      for (const item of dto.items) {
        await this.inventoryService.reserveStock(
          item.productVariantId,
          item.quantity,
          customerUserId,
          tx,
        );
      }

      // Abandon the active cart so it doesn't resurface on next login
      await tx.cart.updateMany({
        where: { customerId: customerUserId, storeId: dto.storeId, status: CartStatus.ACTIVE, deletedAt: null },
        data: { status: CartStatus.ABANDONED },
      });

      return { order, payment };
    });

    // AFTER tx commit — external calls only here
    await setIdempotencyKey(this.prisma, idempotencyKey, {
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
    });

    this.orderSseService.pushNewOrder(dto.storeId, {
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
      status: 'PLACED',
      totalAmount: Number(result.order.totalAmount),
      createdAt: (result.order.createdAt instanceof Date
        ? result.order.createdAt
        : new Date(result.order.createdAt ?? Date.now())
      ).toISOString(),
    });

    this.eventBus.emit(DomainEvents.ORDER_PLACED, {
      orderId: result.order.id,
      storeId: dto.storeId,
      customerId: customerUserId,
      totalAmount: Number(result.order.totalAmount),
    });

    return {
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
      paymentId: result.payment.id,
      requiresPayment: dto.paymentMethod !== PaymentMethod.PAY_AT_PICKUP,
    };
  }

  // ── POS Walk-in Order Processing ──────────────────────────────────────────

  async createPosOrder(storeId: string, dto: CreatePosOrderDto, actorUserId: string) {
    const store = await this.prisma.store.findFirst({ where: { id: storeId, deletedAt: null } });
    if (!store) throw new NotFoundException(`Store ${storeId} not found`);

    const variantIds = dto.items.map((i) => i.productVariantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds }, deletedAt: null, product: { storeId, deletedAt: null } },
      include: { product: true },
    });
    if (variants.length !== variantIds.length) {
      throw new BadRequestException(
        'One or more product variants do not exist or do not belong to this store',
      );
    }
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // Evaluate offers (stub returns zero discount in Phase 1)
    const cartItemsForOffers = dto.items.map((i) => {
      const v = variantMap.get(i.productVariantId)!;
      return {
        productVariantId: i.productVariantId,
        productId: v.productId,
        categoryId: v.product.categoryId,
        quantity: i.quantity,
        unitPrice: i.unitPrice ?? (v.priceOverride ?? v.product.basePrice),
      };
    });
    const { appliedOffer, lineItemDiscounts, totalDiscount } =
      await this.offersService.evaluateOffersForCart(storeId, cartItemsForOffers, 'POS');

    const result = await this.prisma.$transaction(async (tx) => {
      // FOR UPDATE — lock inventory rows before stock check
      await tx.$queryRaw`
        SELECT id FROM "inventory"
        WHERE "product_variant_id" = ANY(${variantIds}::uuid[])
        FOR UPDATE`;

      // Validate direct stock (POS has no reservation phase)
      for (const item of dto.items) {
        const inv = await tx.inventory.findFirst({ where: { productVariantId: item.productVariantId } });
        if ((inv?.quantity ?? 0) < item.quantity) {
          throw new ConflictException({
            code: 'INSUFFICIENT_STOCK',
            variantId: item.productVariantId,
            availableQty: inv?.quantity ?? 0,
            requestedQty: item.quantity,
          });
        }
      }

      // Build order items with GST snapshot
      let subtotal = 0;
      let totalGst = 0;
      const orderItemsData = dto.items.map((item) => {
        const v = variantMap.get(item.productVariantId)!;
        const unitPrice =
          item.unitPrice ?? (v.priceOverride ? Number(v.priceOverride) : Number(v.product.basePrice));
        const gstRate = Number(v.product.gstRatePercent ?? 0);
        const lineTotal = unitPrice * item.quantity;
        const lineGst = (lineTotal * gstRate) / 100;
        const lineDiscount =
          lineItemDiscounts.find((d) => d.variantId === item.productVariantId)?.discountAmount ?? 0;
        subtotal += lineTotal;
        totalGst += lineGst;

        return {
          productVariantId: item.productVariantId,
          productNameSnapshot: `${v.product.name} (${v.variantName})`,
          quantity: item.quantity,
          unitPriceSnapshot: new Prisma.Decimal(unitPrice),
          lineTotal: new Prisma.Decimal(lineTotal),
          gstRatePercentSnapshot: new Prisma.Decimal(gstRate),
          discountAmount: new Prisma.Decimal(lineDiscount),
        };
      });

      const totalAmount = subtotal - totalDiscount;
      const orderNumber = await nextPosOrderNumber(tx);
      const now = new Date();

      const order = await tx.order.create({
        data: {
          orderNumber,
          channel: OrderChannel.POS,
          storeId,
          cityId: store.cityId,
          zoneId: store.zoneId ?? null,
          fulfillmentType: FulfillmentType.TAKEAWAY,
          status: OrderStatus.COMPLETED,
          recordedByUserId: actorUserId,
          subtotal: new Prisma.Decimal(subtotal),
          deliveryFee: new Prisma.Decimal(0),
          discountAmount: new Prisma.Decimal(totalDiscount),
          commissionPercentApplied: new Prisma.Decimal(0), // Phase 2
          commissionAmount: new Prisma.Decimal(0),         // Phase 2
          totalAmount: new Prisma.Decimal(totalAmount),
          paymentMethod: dto.paymentMethod,
          storeNotes: dto.storeNotes ?? null,
          placedAt: now,
          acceptedAt: now,
          readyAt: now,
          completedAt: now,
          createdBy: actorUserId,
          items: { create: orderItemsData },
          statusHistory: {
            create: {
              fromStatus: 'NONE',
              toStatus: OrderStatus.COMPLETED,
              changedByUserId: actorUserId,
              reason: 'Direct POS sale checkout',
            },
          },
        },
      });

      // Optional customer contact
      if (dto.customerPhoneNumber || dto.customerName) {
        await tx.orderCustomerContact.create({
          data: {
            orderId: order.id,
            name: dto.customerName || 'Walk-in Customer',
            phone: dto.customerPhoneNumber || 'N/A',
            createdBy: actorUserId,
          },
        });
      }

      // Snapshot applied offer
      if (appliedOffer) {
        await tx.appliedOffer.create({
          data: {
            orderId: order.id,
            offerId: appliedOffer.offerId,
            discountAmount: new Prisma.Decimal(appliedOffer.discountAmount),
            rewardDetails: appliedOffer.snapshot as any,
          },
        });
      }

      // Payment — always SUCCESS for POS
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: new Prisma.Decimal(totalAmount),
          status: PaymentStatus.SUCCESS,
          method: this.mapPaymentMethodToGateway(dto.paymentMethod),
        },
      });

      // Decrement direct stock — inside tx so atomic with order creation
      for (const item of dto.items) {
        await this.inventoryService.decrementDirectStock(
          storeId,
          item.productVariantId,
          item.quantity,
          order.id,
          actorUserId,
          tx,
        );
      }

      // SalesInvoice — pdfUrl null until Phase 2
      const invoiceNumber = await nextInvoiceNumber(tx);
      const salesInvoice = await tx.salesInvoice.create({
        data: {
          orderId: order.id,
          invoiceNumber,
          gstAmount: new Prisma.Decimal(totalGst),
          totalAmount: new Prisma.Decimal(totalAmount),
          pdfUrl: null, // TODO: Phase 2 — async PDF generation
          createdBy: actorUserId,
        },
      });

      return { order, payment, salesInvoice };
    });

    this.eventBus.emit(DomainEvents.ORDER_POS_COMPLETED, {
      orderId: result.order.id,
      storeId,
      totalAmount: Number(result.order.totalAmount),
    });

    return { order: result.order, salesInvoice: result.salesInvoice };
  }

  // ── Customer Order Actions ─────────────────────────────────────────────────

  async customerCancelOrder(orderId: string, customerUserId: string, dto: { reason?: string }) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId: customerUserId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const secondsElapsed = (Date.now() - order.createdAt.getTime()) / 1000;
    const window =
      CANCEL_WINDOW_SECONDS[order.fulfillmentType as keyof typeof CANCEL_WINDOW_SECONDS] ?? 30;

    if (!['PLACED', 'ACCEPTED'].includes(order.status)) {
      throw new BadRequestException(
        `Order cannot be cancelled by customer once it has moved to status ${order.status}.`,
      );
    }

    if (secondsElapsed > window) {
      throw new BadRequestException(
        `Cancellation window expired. Orders can only be cancelled within ${window} seconds of placement.`,
      );
    }

    return this.cancelOrder(
      order.storeId,
      orderId,
      { reason: dto.reason ?? 'Customer requested cancellation' },
      customerUserId,
    );
  }

  async getCustomerOrders(
    customerId: string,
    options: { status?: string; page?: number; limit?: number },
  ) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          customerId,
          ...(options.status ? { status: options.status as OrderStatus } : {}),
        },
        include: {
          items: {
            include: {
              productVariant: {
                include: { product: { select: { id: true, name: true, images: true } } },
              },
            },
          },
          store: { select: { id: true, name: true } },
          payments: { select: { status: true, method: true, amount: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({
        where: { customerId, ...(options.status ? { status: options.status as OrderStatus } : {}) },
      }),
    ]);

    return { orders, total, page, limit };
  }

  async getCustomerOrderById(orderId: string, customerId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId },
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: { select: { id: true, name: true, images: true } } },
            },
          },
        },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        store: { select: { id: true, name: true, address: true } },
        payments: true,
        appliedOffers: { include: { offer: { select: { title: true, offerType: true } } } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async reorder(orderId: string, customerId: string, _dto: any) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    // TODO Phase 2: merge items into active backend cart via CartService
    return { message: 'Reorder queued', storeId: order.storeId };
  }

  // ── Sales Invoices ─────────────────────────────────────────────────────────

  async listSalesInvoices(storeId: string, page = 1, limit = 20) {
    const where = { order: { storeId }, deletedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.salesInvoice.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              channel: true,
              subtotal: true,
              discountAmount: true,
              totalAmount: true,
              paymentMethod: true,
              completedAt: true,
              customerContact: true,
              store: { select: { id: true, name: true, address: true } },
              items: {
                select: {
                  id: true,
                  productNameSnapshot: true,
                  quantity: true,
                  unitPriceSnapshot: true,
                  gstRatePercentSnapshot: true,
                  lineTotal: true,
                },
              },
            },
          },
        },
        orderBy: { issuedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.salesInvoice.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async getSalesInvoice(storeId: string, invoiceId: string) {
    const invoice = await this.prisma.salesInvoice.findFirst({
      where: { id: invoiceId, order: { storeId }, deletedAt: null },
      include: {
        order: {
          include: {
            items: true,
            customerContact: true,
            store: { select: { id: true, name: true, address: true } },
          },
        },
      },
    });
    if (!invoice) throw new NotFoundException(`Sales invoice ${invoiceId} not found`);
    return invoice;
  }

  // ── Delivery Staff Management ─────────────────────────────────────────────

  async listDeliveryStaff(storeId: string) {
    return this.prisma.storeDeliveryStaff.findMany({
      where: { storeId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async createDeliveryStaff(storeId: string, dto: CreateDeliveryStaffDto, actorUserId: string) {
    return this.prisma.storeDeliveryStaff.create({
      data: { storeId, name: dto.name, phone: dto.phone, isActive: true, createdBy: actorUserId },
    });
  }

  async updateDeliveryStaff(
    storeId: string,
    staffId: string,
    dto: UpdateDeliveryStaffDto,
    actorUserId: string,
  ) {
    const staff = await this.prisma.storeDeliveryStaff.findFirst({
      where: { id: staffId, storeId, deletedAt: null },
    });
    if (!staff) throw new NotFoundException(`Delivery staff ${staffId} not found`);

    return this.prisma.storeDeliveryStaff.update({
      where: { id: staffId },
      data: {
        name: dto.name !== undefined ? dto.name : undefined,
        phone: dto.phone !== undefined ? dto.phone : undefined,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
        updatedBy: actorUserId,
      },
    });
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  private async recordStatusChange(
    orderId: string,
    fromStatus: string,
    toStatus: string,
    actorUserId: string,
    reason?: string,
  ) {
    return this.prisma.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus,
        toStatus,
        changedByUserId: actorUserId,
        reason: reason ?? null,
      },
    });
  }

  private mapPaymentMethodToGateway(method: PaymentMethod): PaymentGatewayMethod {
    switch (method) {
      case PaymentMethod.UPI:
        return PaymentGatewayMethod.UPI;
      case PaymentMethod.CARD:
        return PaymentGatewayMethod.CARD;
      case PaymentMethod.COD:
      case PaymentMethod.PAY_AT_PICKUP:
      default:
        return PaymentGatewayMethod.COD;
    }
  }
}
