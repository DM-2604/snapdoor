import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  Product,
  ProductVariant,
  Store,
  StoreHourException,
  StoreOperatingHour,
  StoreStatus,
} from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { AuditLogService } from '../admin-ops/audit-log.service';
import { DocumentsService } from '../documents/documents.service';
import { InventoryService } from '../inventory/inventory.service';
import { getStoreLocation, setStoreLocation } from '../../shared/database/geo';
import {
  CreateHourExceptionDto,
  CreateProductDto,
  CreateProductVariantDto,
  CreateStoreCategoryDto,
  SubmitForReviewDto,
  TogglePauseDto,
  UpdateProductDto,
  UpdateProductVariantDto,
  UpdateStoreProfileDto,
  UpsertOperatingHoursDto,
} from './dto/store-owner-catalog.dto';


@Injectable()
export class StoreOwnerCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly documentsService: DocumentsService,
    private readonly inventoryService: InventoryService,
  ) {}

  // ── Store Profile & Settings ──────────────────────────────────────────────

  async getProfile(storeId: string) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, deletedAt: null },
      include: {
        businessCategory: { select: { id: true, name: true, iconUrl: true } },
        city: { select: { id: true, name: true } },
        zone: { select: { id: true, name: true } },
        operatingHours: { orderBy: { dayOfWeek: 'asc' }, where: { deletedAt: null } },
        hourExceptions: {
          where: { exceptionDate: { gte: new Date() }, deletedAt: null },
          orderBy: { exceptionDate: 'asc' },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(`Store ${storeId} not found`);
    }

    const location = await getStoreLocation(this.prisma as any, storeId);

    return {
      ...store,
      location,
    };
  }

  async updateProfile(storeId: string, dto: UpdateStoreProfileDto, actorUserId: string) {
    const existing = await this.prisma.store.findFirst({
      where: { id: storeId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException(`Store ${storeId} not found`);

    const data: Prisma.StoreUpdateInput = {
      updatedBy: actorUserId,
    };

    if (dto.description !== undefined) data.description = dto.description;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.photos !== undefined) data.photos = dto.photos;
    if (dto.takeawayEnabled !== undefined) data.takeawayEnabled = dto.takeawayEnabled;
    if (dto.deliveryEnabled !== undefined) data.deliveryEnabled = dto.deliveryEnabled;
    if (dto.deliveryRadiusKm !== undefined) data.deliveryRadiusKm = dto.deliveryRadiusKm;
    if (dto.deliveryFee !== undefined) data.deliveryFee = dto.deliveryFee;
    if (dto.avgPrepTimeMinutes !== undefined) data.avgPrepTimeMinutes = dto.avgPrepTimeMinutes;

    const updated = await this.prisma.store.update({
      where: { id: storeId },
      data,
    });

    await this.auditLog.record(
      actorUserId,
      'STORE_PROFILE_UPDATED',
      'Store',
      storeId,
      { address: existing.address },
      { address: updated.address },
    );

    return updated;
  }

  // ── Operating Hours & Exceptions ──────────────────────────────────────────

  async getOperatingHours(storeId: string) {
    const [hours, exceptions] = await Promise.all([
      this.prisma.storeOperatingHour.findMany({
        where: { storeId, deletedAt: null },
        orderBy: { dayOfWeek: 'asc' },
      }),
      this.prisma.storeHourException.findMany({
        where: { storeId, deletedAt: null },
        orderBy: { exceptionDate: 'asc' },
      }),
    ]);

    return { hours, exceptions };
  }

  async upsertOperatingHours(storeId: string, dto: UpsertOperatingHoursDto, actorUserId: string) {
    await this.prisma.$transaction(
      dto.hours.map((item) =>
        this.prisma.storeOperatingHour.upsert({
          where: {
            storeId_dayOfWeek: {
              storeId,
              dayOfWeek: item.dayOfWeek,
            },
          },
          create: {
            storeId,
            dayOfWeek: item.dayOfWeek,
            openTime: item.openTime ?? null,
            closeTime: item.closeTime ?? null,
            isClosed: item.isClosed,
            createdBy: actorUserId,
          },
          update: {
            openTime: item.openTime ?? null,
            closeTime: item.closeTime ?? null,
            isClosed: item.isClosed,
            updatedBy: actorUserId,
            deletedAt: null,
          },
        }),
      ),
    );

    return this.getOperatingHours(storeId);
  }

  async createHourException(storeId: string, dto: CreateHourExceptionDto, actorUserId: string) {
    const date = new Date(dto.exceptionDate);
    const existing = await this.prisma.storeHourException.findFirst({
      where: { storeId, exceptionDate: date, deletedAt: null },
    });

    if (existing) {
      return this.prisma.storeHourException.update({
        where: { id: existing.id },
        data: {
          isClosed: dto.isClosed,
          openTime: dto.openTime ?? null,
          closeTime: dto.closeTime ?? null,
          reason: dto.reason ?? null,
          updatedBy: actorUserId,
        },
      });
    }

    return this.prisma.storeHourException.create({
      data: {
        storeId,
        exceptionDate: date,
        isClosed: dto.isClosed,
        openTime: dto.openTime ?? null,
        closeTime: dto.closeTime ?? null,
        reason: dto.reason ?? null,
        createdBy: actorUserId,
      },
    });
  }

  async deleteHourException(storeId: string, exceptionId: string, actorUserId: string) {
    const exception = await this.prisma.storeHourException.findFirst({
      where: { id: exceptionId, storeId, deletedAt: null },
    });

    if (!exception) throw new NotFoundException(`Exception ${exceptionId} not found`);

    return this.prisma.storeHourException.update({
      where: { id: exceptionId },
      data: { deletedAt: new Date(), deletedBy: actorUserId },
    });
  }

  // ── Pause & Resume ────────────────────────────────────────────────────────

  async togglePause(storeId: string, dto: TogglePauseDto, actorUserId: string) {
    const updated = await this.prisma.store.update({
      where: { id: storeId },
      data: {
        isTemporarilyPaused: dto.isTemporarilyPaused,
        pausedUntil: dto.isTemporarilyPaused && dto.pausedUntil ? new Date(dto.pausedUntil) : null,
        pauseReason: dto.isTemporarilyPaused ? dto.pauseReason ?? null : null,
        updatedBy: actorUserId,
      },
    });

    await this.auditLog.record(
      actorUserId,
      dto.isTemporarilyPaused ? 'STORE_PAUSED' : 'STORE_RESUMED',
      'Store',
      storeId,
      null,
      { isTemporarilyPaused: dto.isTemporarilyPaused, reason: dto.pauseReason },
    );

    return updated;
  }

  // ── Submit for Review (DRAFT -> PENDING) ───────────────────────────────────

  async submitForReview(storeId: string, dto: SubmitForReviewDto, actorUserId: string) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, deletedAt: null },
    });

    if (!store) throw new NotFoundException(`Store ${storeId} not found`);

    if (store.status === StoreStatus.LIVE) {
      throw new BadRequestException('Store is already LIVE');
    }
    if (store.status === StoreStatus.REJECTED) {
      throw new BadRequestException('Store has been permanently rejected');
    }

    // Check KYC documents
    const kyc = await this.documentsService.getKycStatus(storeId, store.ownerUserId);
    if (!kyc.allRequiredUploaded) {
      throw new BadRequestException(
        `Cannot submit for review: required documents (${kyc.missingRequiredDocs.join(', ')}) are missing.`,
      );
    }

    if (dto.latitude != null && dto.longitude != null) {
      await setStoreLocation(this.prisma as any, storeId, dto.latitude, dto.longitude);
    }

    const location = await getStoreLocation(this.prisma as any, storeId);
    if (!location) {
      throw new BadRequestException('Store location pin (latitude & longitude) must be set before submission');
    }

    const updated = await this.prisma.store.update({
      where: { id: storeId },
      data: {
        status: StoreStatus.PENDING,
        updatedBy: actorUserId,
      },
    });

    await this.prisma.storeApprovalQueue.create({
      data: {
        storeId,
        decision: 'PENDING',
        createdBy: actorUserId,
      },
    });

    await this.auditLog.record(
      actorUserId,
      'STORE_SUBMITTED_FOR_REVIEW',
      'Store',
      storeId,
      { status: store.status },
      { status: StoreStatus.PENDING },
    );

    return updated;
  }

  // ── Product Category Management (Store-owned) ─────────────────────────────

  async listCategoriesForStore(storeId: string, businessCategoryId: string) {
    const [businessCategory, myCategories] = await Promise.all([
      this.prisma.category.findUnique({ where: { id: businessCategoryId } }),
      this.prisma.category.findMany({
        where: { storeId, deletedAt: null },
        orderBy: [{ parentCategoryId: 'asc' }, { name: 'asc' }],
      }),
    ]);

    return { businessCategory, myCategories };
  }

  async createStoreCategory(
    storeId: string,
    businessCategoryId: string,
    dto: CreateStoreCategoryDto,
    actorUserId: string,
  ) {
    const parent = await this.prisma.category.findFirst({
      where: { id: dto.parentCategoryId, deletedAt: null },
    });

    if (!parent) throw new NotFoundException(`Parent category ${dto.parentCategoryId} not found`);

    // Parent must be the store's business vertical (global) OR another category the store owns
    const isValidParent =
      (parent.id === businessCategoryId && parent.storeId === null) ||
      parent.storeId === storeId;

    if (!isValidParent) {
      throw new ForbiddenException('Parent category must be your business vertical or one of your own categories');
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        parentCategoryId: dto.parentCategoryId,
        storeId,
        isActive: true,
        createdBy: actorUserId,
      },
    });

    await this.auditLog.record(actorUserId, 'STORE_CATEGORY_CREATED', 'Category', category.id, null, {
      name: category.name,
      parentCategoryId: category.parentCategoryId,
    });

    return category;
  }

  async deleteStoreCategory(storeId: string, categoryId: string, actorUserId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, deletedAt: null },
    });

    if (!category) throw new NotFoundException(`Category ${categoryId} not found`);
    if (category.storeId !== storeId) {
      throw new ForbiddenException('You can only delete your own product categories');
    }

    await this.prisma.$transaction(async (tx) => {
      // Prisma updateMany does not support writing relation FK scalars in `data`.
      // Use raw SQL so we can set category_id directly.
      if (category.parentCategoryId) {
        // Reassign products to the parent category
        await tx.$executeRaw`
          UPDATE products
          SET    category_id = ${category.parentCategoryId}::uuid,
                 updated_by  = ${actorUserId}
          WHERE  category_id = ${categoryId}::uuid
            AND  store_id    = ${storeId}::uuid
            AND  deleted_at  IS NULL
        `;
      }
      // If parentCategoryId is null there is no safe parent to move to;
      // leave the products pointing at the to-be-deleted category —
      // the menu query already filters out soft-deleted categories so
      // those products simply won't appear in the customer menu.

      // Soft-delete the category
      await tx.category.update({
        where: { id: categoryId },
        data: { deletedAt: new Date(), deletedBy: actorUserId },
      });
    });

    await this.auditLog.record(actorUserId, 'STORE_CATEGORY_DELETED', 'Category', categoryId, {
      name: category.name,
    }, null);

    return { success: true, message: `Category "${category.name}" deleted and products reassigned` };
  }

  // ── Product & Variant Catalog Management ──────────────────────────────────

  async listProducts(
    storeId: string,
    options: {
      categoryId?: string;
      isActive?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 50;

    const where: Prisma.ProductWhereInput = {
      storeId,
      deletedAt: null,
      ...(options.categoryId ? { categoryId: options.categoryId } : {}),
      ...(options.isActive !== undefined ? { isActive: options.isActive } : {}),
      ...(options.search
        ? {
            OR: [
              { name: { contains: options.search, mode: 'insensitive' } },
              { sku: { contains: options.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          variants: {
            where: { deletedAt: null },
            include: { inventory: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getProduct(storeId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, storeId, deletedAt: null },
      include: {
        category: { select: { id: true, name: true, parentCategoryId: true } },
        variants: {
          where: { deletedAt: null },
          include: { inventory: true },
        },
      },
    });

    if (!product) throw new NotFoundException(`Product ${productId} not found`);
    return product;
  }

  async createProduct(storeId: string, dto: CreateProductDto, actorUserId: string) {
    // Determine category ID: if provided, use it; otherwise fallback to store's businessCategoryId
    let categoryId = dto.storeCategoryId;
    if (!categoryId) {
      const store = await this.prisma.store.findFirst({
        where: { id: storeId, deletedAt: null },
      });
      categoryId = store?.businessCategoryId;
    }

    if (!categoryId) {
      throw new BadRequestException('Valid categoryId is required to create a product');
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          storeId,
          categoryId,
          name: dto.name,
          description: dto.description ?? null,
          sku: dto.sku ?? null,
          basePrice: dto.sellingPrice,
          hsnCode: dto.hsnCode ?? null,
          gstRatePercent: dto.gstRatePercent ?? 0,
          images: dto.images ?? Prisma.DbNull,
          isActive: true,
          createdBy: actorUserId,
        },
      });

      // Automatically create default variant
      const variant = await tx.productVariant.create({
        data: {
          productId: product.id,
          variantName: dto.variantName || 'Standard',
          sku: dto.sku ?? null,
          priceOverride: dto.sellingPrice,
          isActive: true,
          createdBy: actorUserId,
        },
      });

      // Initialize inventory for the default variant
      const inventory = await this.inventoryService.initInventory(
        variant.id,
        dto.initialStockQuantity ?? 0,
        dto.lowStockThreshold ?? 5,
        dto.autoDisableAtZero ?? true,
        actorUserId,
        tx as any,
      );

      return {
        ...product,
        variants: [{ ...variant, inventory }],
      };
    });
  }

  async updateProduct(
    storeId: string,
    productId: string,
    dto: UpdateProductDto,
    actorUserId: string,
  ) {
    await this.getProduct(storeId, productId);

    const data: Prisma.ProductUpdateInput = {
      updatedBy: actorUserId,
    };

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.sellingPrice !== undefined) data.basePrice = dto.sellingPrice;
    if (dto.hsnCode !== undefined) data.hsnCode = dto.hsnCode;
    if (dto.gstRatePercent !== undefined) data.gstRatePercent = dto.gstRatePercent;
    if (dto.images !== undefined) data.images = dto.images;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.storeCategoryId !== undefined) data.category = { connect: { id: dto.storeCategoryId } };

    return this.prisma.product.update({
      where: { id: productId },
      data,
      include: {
        category: true,
        variants: { where: { deletedAt: null }, include: { inventory: true } },
      },
    });
  }

  async deleteProduct(storeId: string, productId: string, actorUserId: string) {
    await this.getProduct(storeId, productId);

    // Soft delete product and its variants
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.product.update({
        where: { id: productId },
        data: { deletedAt: now, deletedBy: actorUserId, isActive: false },
      }),
      this.prisma.productVariant.updateMany({
        where: { productId, deletedAt: null },
        data: { deletedAt: now, deletedBy: actorUserId, isActive: false },
      }),
    ]);

    return { success: true, message: `Product ${productId} deleted` };
  }

  async createVariant(
    storeId: string,
    productId: string,
    dto: CreateProductVariantDto,
    actorUserId: string,
  ) {
    await this.getProduct(storeId, productId);

    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.create({
        data: {
          productId,
          variantName: dto.name,
          sku: dto.sku ?? null,
          priceOverride: dto.sellingPrice,
          isActive: true,
          createdBy: actorUserId,
        },
      });

      const inventory = await this.inventoryService.initInventory(
        variant.id,
        dto.initialStockQuantity ?? 0,
        dto.lowStockThreshold ?? 5,
        dto.autoDisableAtZero ?? true,
        actorUserId,
        tx as any,
      );

      return { ...variant, inventory };
    });
  }

  async updateVariant(
    storeId: string,
    productId: string,
    variantId: string,
    dto: UpdateProductVariantDto,
    actorUserId: string,
  ) {
    await this.getProduct(storeId, productId);

    const existingVariant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId, deletedAt: null },
    });

    if (!existingVariant) throw new NotFoundException(`Variant ${variantId} not found`);

    const data: Prisma.ProductVariantUpdateInput = {
      updatedBy: actorUserId,
    };

    if (dto.name !== undefined) data.variantName = dto.name;
    if (dto.sku !== undefined) data.sku = dto.sku;
    if (dto.sellingPrice !== undefined) data.priceOverride = dto.sellingPrice;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data,
      include: { inventory: true },
    });
  }

  async deleteVariant(
    storeId: string,
    productId: string,
    variantId: string,
    actorUserId: string,
  ) {
    await this.getProduct(storeId, productId);

    const existingVariant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId, deletedAt: null },
    });

    if (!existingVariant) throw new NotFoundException(`Variant ${variantId} not found`);

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { deletedAt: new Date(), deletedBy: actorUserId, isActive: false },
    });
  }

  // ── Store Analytics ────────────────────────────────────────────────────────

  async getStoreAnalytics(storeId: string, period: '7d' | '30d' | '90d' = '7d') {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const orderWhere: Prisma.OrderWhereInput = {
      storeId,
      status: 'COMPLETED',
      createdAt: { gte: startDate },
    };

    // Run all 5 aggregates in parallel — no sequential blocking
    const [
      orderAggregate,
      activeProducts,
      revenueByDayRaw,
      salesByCategoryRaw,
      topCustomersRaw,
    ] = await Promise.all([
      // 1. KPI totals
      this.prisma.order.aggregate({
        where: orderWhere,
        _sum: { subtotal: true },
        _count: { id: true },
      }),

      // 2. Active product count
      this.prisma.product.count({
        where: { storeId, isActive: true, deletedAt: null },
      }),

      // 3. Revenue grouped by day (raw SQL — Prisma can't do DATE_TRUNC natively)
      this.prisma.$queryRaw<Array<{ day: Date; revenue: string; orders: string }>>`
        SELECT
          DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Kolkata') AS day,
          SUM(subtotal)::text AS revenue,
          COUNT(id)::text AS orders
        FROM orders
        WHERE store_id = ${storeId}::uuid
          AND status = 'COMPLETED'
          AND created_at >= ${startDate}
        GROUP BY 1
        ORDER BY 1 ASC
      `,

      // 4. Revenue by category (join through order_items → product_variants → products → categories)
      this.prisma.$queryRaw<Array<{ category_id: string; category_name: string; revenue: string }>>`
        SELECT
          c.id AS category_id,
          c.name AS category_name,
          SUM(oi.line_total)::text AS revenue
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN product_variants pv ON pv.id = oi.product_variant_id
        JOIN products p ON p.id = pv.product_id
        JOIN categories c ON c.id = p.category_id
        WHERE o.store_id = ${storeId}::uuid
          AND o.status = 'COMPLETED'
          AND o.created_at >= ${startDate}
        GROUP BY c.id, c.name
        ORDER BY SUM(oi.line_total) DESC
        LIMIT 10
      `,

      // 5. Top 5 customers by spend
      this.prisma.$queryRaw<Array<{ customer_id: string | null; total_spent: string; order_count: string }>>`
        SELECT
          customer_id,
          SUM(subtotal)::text AS total_spent,
          COUNT(id)::text AS order_count
        FROM orders
        WHERE store_id = ${storeId}::uuid
          AND status = 'COMPLETED'
          AND created_at >= ${startDate}
        GROUP BY customer_id
        ORDER BY SUM(subtotal) DESC
        LIMIT 5
      `,
    ]);

    // Resolve customer names for top customers
    const customerIds = topCustomersRaw
      .map((r) => r.customer_id)
      .filter((id): id is string => id !== null);

    const users = customerIds.length > 0
      ? await this.prisma.user.findMany({
          where: { id: { in: customerIds } },
          select: { id: true, name: true, phoneNumber: true },
        })
      : [];

    const userMap = new Map(users.map((u) => [u.id, u]));

    // ── Build response ───────────────────────────────────────────────────────

    const totalRevenue = Number(orderAggregate._sum.subtotal ?? 0);
    const totalOrders = orderAggregate._count.id;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Fill in missing days with 0s so the chart always has the full period
    const revenueByDay = this.buildDailyTimeline(startDate, days, revenueByDayRaw);

    // Category revenue share
    const catTotalRevenue = salesByCategoryRaw.reduce((sum, r) => sum + Number(r.revenue), 0);
    const salesByCategory = salesByCategoryRaw.map((r) => ({
      categoryId: r.category_id,
      categoryName: r.category_name,
      totalRevenue: Number(r.revenue),
      revenueShare: catTotalRevenue > 0
        ? Math.round((Number(r.revenue) / catTotalRevenue) * 100)
        : 0,
    }));

    // Top customers
    const topCustomers = topCustomersRaw.map((r) => {
      const user = r.customer_id ? userMap.get(r.customer_id) : null;
      const name = user?.name ?? (r.customer_id ? 'Customer' : 'Walk-in');
      const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
      return {
        customerId: r.customer_id ?? null,
        name,
        initials,
        orderCount: Number(r.order_count),
        totalSpent: Number(r.total_spent),
      };
    });

    return {
      period,
      generatedAt: new Date().toISOString(),
      kpis: { totalOrders, totalRevenue, avgOrderValue, activeProducts },
      revenueByDay,
      salesByCategory,
      topCustomers,
    };
  }

  /** Builds a complete daily timeline, filling missing days with revenue=0, orders=0 */
  private buildDailyTimeline(
    startDate: Date,
    days: number,
    raw: Array<{ day: Date; revenue: string; orders: string }>,
  ) {
    const map = new Map<string, { revenue: number; orders: number }>();
    for (const r of raw) {
      const key = new Date(r.day).toISOString().split('T')[0];
      map.set(key, { revenue: Number(r.revenue), orders: Number(r.orders) });
    }

    const timeline = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      const data = map.get(key) ?? { revenue: 0, orders: 0 };

      // Label: "Mon" for 7d, "Aug 1" for 30d/90d
      const label = days === 7
        ? d.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' })
        : d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' });

      timeline.push({ date: label, isoDate: key, revenue: data.revenue, orders: data.orders });
    }
    return timeline;
  }
}

