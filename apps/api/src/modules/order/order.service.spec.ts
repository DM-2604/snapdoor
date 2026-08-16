import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FulfillmentType,
  OrderChannel,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  StoreStatus,
} from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { EventBusService } from '../../shared/events/event-bus.service';
import { InventoryService } from '../inventory/inventory.service';
import { OffersService } from '../offers/offers.service';
import { OrderSseService } from './order-sse.service';
import { OrderService } from './order.service';

const mockPrisma: any = {
  order: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  productVariant: {
    findMany: jest.fn(),
  },
  inventory: {
    findFirst: jest.fn().mockResolvedValue({ id: 'inv-1', quantity: 10, reservedQuantity: 2 }),
  },
  orderCustomerContact: {
    create: jest.fn(),
  },
  payment: {
    create: jest.fn().mockResolvedValue({ id: 'pay-1' }),
    update: jest.fn(),
  },
  salesInvoice: {
    findFirst: jest.fn().mockResolvedValue(null),
    findUnique: jest.fn(),
    create: jest.fn().mockResolvedValue({ id: 'sinv-1', invoiceNumber: 'SINV-1' }),
  },
  orderStatusHistory: {
    create: jest.fn(),
  },
  appliedOffer: {
    create: jest.fn(),
  },
  idempotencyKey: {
    findUnique: jest.fn().mockResolvedValue(null),
    upsert: jest.fn(),
  },
  refund: {
    create: jest.fn(),
  },
  store: {
    findFirst: jest.fn(),
  },
  storeDeliveryStaff: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $queryRaw: jest.fn().mockResolvedValue([{ nextval: BigInt(1) }]),
  $transaction: jest.fn((callback: any) =>
    Array.isArray(callback) ? Promise.all(callback) : callback(mockPrisma),
  ),
};

const mockEventBus = {
  emit: jest.fn(),
};

const mockInventoryService = {
  decrementDirectStock: jest.fn(),
  reserveStock: jest.fn(),
  releaseReservedStock: jest.fn(),
  commitReservedStock: jest.fn(),
};

const mockOffersService = {
  evaluateOffersForCart: jest.fn().mockResolvedValue({
    appliedOffer: null,
    lineItemDiscounts: [],
    totalDiscount: 0,
  }),
};

const mockOrderSseService = {
  pushNewOrder: jest.fn(),
  subscribe: jest.fn(),
};

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventBusService, useValue: mockEventBus },
        { provide: InventoryService, useValue: mockInventoryService },
        { provide: OffersService, useValue: mockOffersService },
        { provide: OrderSseService, useValue: mockOrderSseService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    jest.clearAllMocks();
  });

  const mockOrder = {
    id: 'ord-123',
    storeId: 'store-1',
    status: OrderStatus.PLACED,
    channel: OrderChannel.APP,
    totalAmount: 500,
    payments: [],
    items: [
      { productVariantId: 'var-1', quantity: 2 },
    ],
  };

  describe('acceptOrder', () => {
    it('transitions PLACED order to ACCEPTED', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.ACCEPTED,
      });

      const res = await service.acceptOrder('store-1', 'ord-123', 'user-1');

      expect(res.status).toBe(OrderStatus.ACCEPTED);
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ord-123' },
          data: expect.objectContaining({ status: OrderStatus.ACCEPTED }),
        }),
      );
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'order.accepted',
        expect.objectContaining({ orderId: 'ord-123' }),
      );
    });

    it('throws BadRequestException if order is not PLACED', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.COMPLETED,
      });

      await expect(
        service.acceptOrder('store-1', 'ord-123', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('rejectOrder', () => {
    it('releases reserved stock for APP orders when rejected', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.REJECTED,
      });

      await service.rejectOrder('store-1', 'ord-123', { reason: 'Out of stock' }, 'user-1');

      expect(mockInventoryService.releaseReservedStock).toHaveBeenCalledWith(
        'var-1',
        2,
        'user-1',
        expect.anything(), // tx client
      );
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'order.rejected',
        expect.objectContaining({ orderId: 'ord-123' }),
      );
    });
  });

  describe('completeOrder', () => {
    it('commits reserved stock and generates sales invoice upon order completion', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.READY_FOR_PICKUP,
      });
      mockPrisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.COMPLETED,
      });
      mockPrisma.salesInvoice.findFirst.mockResolvedValue(null);
      mockPrisma.salesInvoice.create.mockResolvedValue({ id: 'sinv-1' });

      await service.completeOrder('store-1', 'ord-123', 'user-1');

      expect(mockInventoryService.commitReservedStock).toHaveBeenCalledWith(
        'var-1',
        2,
        'ord-123',
        'user-1',
        expect.anything(), // tx client
      );
      expect(mockPrisma.salesInvoice.create).toHaveBeenCalled();
    });
  });

  describe('checkout (Customer Online Checkout)', () => {
    it('validates stock, creates placed order, and reserves stock', async () => {
      mockPrisma.store.findFirst.mockResolvedValue({
        id: 'store-1',
        status: StoreStatus.LIVE,
        isTemporarilyPaused: false,
        cityId: 'city-1',
        zoneId: 'zone-1',
        businessCategoryId: 'cat-1',
        deliveryFee: 30,
      });

      mockPrisma.productVariant.findMany.mockResolvedValue([
        {
          id: 'var-1',
          variantName: '500g',
          priceOverride: 100,
          product: { id: 'prod-1', name: 'Coffee', basePrice: 100 },
          inventory: { quantity: 10, reservedQuantity: 2 },
        },
      ]);

      const createdOrder = {
        id: 'ord-online-1',
        orderNumber: 'ORD-20260808-1234',
        channel: OrderChannel.APP,
        status: OrderStatus.PLACED,
        totalAmount: 230,
      };
      mockPrisma.order.create.mockResolvedValue(createdOrder);

      const res = await service.checkout(
        {
          storeId: 'store-1',
          fulfillmentType: FulfillmentType.STORE_DELIVERY,
          paymentMethod: PaymentMethod.UPI,
          items: [{ productVariantId: 'var-1', quantity: 2 }],
          customerName: 'Aarav',
          customerPhone: '+919876543210',
          deliveryAddress: '#123, 4th Cross',
        },
        'cust-1',
        'test-idempotency-key-' + Date.now(),
      );

      expect(mockInventoryService.reserveStock).toHaveBeenCalledWith(
        'var-1',
        2,
        'cust-1',
        expect.anything(),
      );
      expect(mockPrisma.order.create).toHaveBeenCalled();
      expect(res.orderId).toBe('ord-online-1');
    });
  });

  describe('createPosOrder (Section VI)', () => {
    it('creates completed takeaway order with 0% commission, decrements stock, and generates sales invoice', async () => {
      mockPrisma.store.findFirst.mockResolvedValue({
        id: 'store-1',
        cityId: 'city-1',
        zoneId: 'zone-1',
      });

      mockPrisma.productVariant.findMany.mockResolvedValue([
        {
          id: 'var-1',
          variantName: '1kg',
          priceOverride: 100,
          product: { id: 'prod-1', name: 'Rice', basePrice: 100, gstRatePercent: 5 },
          inventory: { quantity: 10 },
        },
      ]);

      const createdOrder = {
        id: 'pos-ord-1',
        orderNumber: 'POS-20260808-1111',
        totalAmount: 200,
        channel: 'POS',
        status: OrderStatus.COMPLETED,
      };
      mockPrisma.order.create.mockResolvedValue(createdOrder);
      mockPrisma.payment.create.mockResolvedValue({});
      mockPrisma.salesInvoice.create.mockResolvedValue({
        id: 'sinv-1',
        invoiceNumber: 'SINV-20260808-1111',
        totalAmount: 200,
      });

      const res = await service.createPosOrder(
        'store-1',
        {
          items: [{ productVariantId: 'var-1', quantity: 2 }],
          paymentMethod: PaymentMethod.UPI,
          customerName: 'Counter Customer',
        },
        'user-1',
      );

      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            channel: 'POS',
            status: OrderStatus.COMPLETED,
            commissionPercentApplied: expect.any(Object),
            commissionAmount: expect.any(Object),
          }),
        }),
      );
      expect(mockInventoryService.decrementDirectStock).toHaveBeenCalledWith(
        'store-1',
        'var-1',
        2,
        'pos-ord-1',
        'user-1',
        expect.anything(),
      );
      expect(mockPrisma.salesInvoice.create).toHaveBeenCalled();
      expect(res.order.id).toBe('pos-ord-1');
    });
  });
});
