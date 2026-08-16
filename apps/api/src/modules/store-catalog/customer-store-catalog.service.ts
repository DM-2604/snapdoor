import { Injectable, NotFoundException } from '@nestjs/common';
import { DiscountType, Prisma, StoreStatus } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { findStoresDeliverableTo } from '../../shared/database/geo';

@Injectable()
export class CustomerStoreCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  // ── GET /customer/stores/nearby ─────────────────────────────────────────────

  async findNearbyStores(lat: number, lng: number) {
    const stores = await findStoresDeliverableTo(
      this.prisma as any,
      lat,
      lng,
    );

    // Enrich with open/closed calculation and category info
    const enriched = await Promise.all(
      stores.map(async (s) => {
        const isOpen = await this.checkIfStoreIsOpen(s.id, s.isTemporarilyPaused);
        return {
          id: s.id,
          storeCode: s.storeCode,
          name: s.name,
          description: s.description,
          businessCategoryId: s.businessCategoryId,
          address: s.address,
          photos: s.photos,
          takeawayEnabled: s.takeawayEnabled,
          deliveryEnabled: s.deliveryEnabled,
          deliveryRadiusKm: s.deliveryRadiusKm ? Number(s.deliveryRadiusKm) : null,
          deliveryFee: s.deliveryFee ? Number(s.deliveryFee) : null,
          avgPrepTimeMinutes: s.avgPrepTimeMinutes,
          distanceKm: Math.round((s.distanceMeters / 1000) * 10) / 10,
          isOpen,
          location: { lat: s.lat, lng: s.lng },
        };
      }),
    );

    return enriched;
  }

  // ── GET /customer/stores/:id ───────────────────────────────────────────────

  async getStoreDetails(storeId: string) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, status: StoreStatus.LIVE, deletedAt: null },
      include: {
        businessCategory: { select: { id: true, name: true, iconUrl: true } },
        operatingHours: {
          where: { deletedAt: null },
          orderBy: { dayOfWeek: 'asc' },
        },
        hourExceptions: {
          where: { deletedAt: null },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(`Store ${storeId} not found or not active`);
    }

    const isOpen = this.computeIsOpenStatus(
      store.isTemporarilyPaused,
      store.operatingHours,
      store.hourExceptions,
    );

    return {
      id: store.id,
      storeCode: store.storeCode,
      name: store.name,
      description: store.description,
      address: store.address,
      businessCategory: store.businessCategory,
      photos: store.photos,
      takeawayEnabled: store.takeawayEnabled,
      deliveryEnabled: store.deliveryEnabled,
      deliveryRadiusKm: store.deliveryRadiusKm ? Number(store.deliveryRadiusKm) : null,
      deliveryFee: store.deliveryFee ? Number(store.deliveryFee) : null,
      avgPrepTimeMinutes: store.avgPrepTimeMinutes,
      isOpen,
      operatingHours: store.operatingHours.map((h) => ({
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed,
      })),
    };
  }

  // ── GET /customer/stores/:id/menu ──────────────────────────────────────────

  async getStoreMenu(storeId: string) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, status: StoreStatus.LIVE, deletedAt: null },
      select: { id: true, name: true, businessCategoryId: true, avgPrepTimeMinutes: true },
    });

    if (!store) {
      throw new NotFoundException(`Store ${storeId} not found or not active`);
    }

    const now = new Date();

    // Fetch active sales applicable to this store / products / categories
    const activeSales = await this.prisma.sale.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
        AND: [
          {
            OR: [
              { storeId: store.id },
              { categoryId: store.businessCategoryId },
              { productId: { not: null } },
            ],
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch active products with variants & inventory
    const products = await this.prisma.product.findMany({
      where: { storeId, isActive: true, deletedAt: null },
      include: {
        category: { select: { id: true, name: true } },
        variants: {
          where: { isActive: true, deletedAt: null },
          include: {
            inventory: {
              select: { quantity: true, reservedQuantity: true },
            },
          },
        },
      },
      orderBy: [{ categoryId: 'asc' }, { name: 'asc' }],
    });

    const menu = products.map((product) => {
      const basePrice = Number(product.basePrice);
      const effectiveSale = this.resolveEffectiveSale(product, store.id, activeSales);
      const effectiveSalePrice = effectiveSale
        ? this.calculateDiscountedPrice(basePrice, effectiveSale)
        : null;

      const variants = product.variants.map((v) => {
        const vPrice = v.priceOverride ? Number(v.priceOverride) : basePrice;
        const vEffectiveSalePrice = effectiveSale
          ? this.calculateDiscountedPrice(vPrice, effectiveSale)
          : null;
        const availableStock = v.inventory
          ? Math.max(0, v.inventory.quantity - v.inventory.reservedQuantity)
          : 0;

        return {
          id: v.id,
          variantName: v.variantName,
          sku: v.sku,
          price: vPrice,
          effectiveSalePrice: vEffectiveSalePrice,
          inStock: availableStock > 0,
          availableStock,
        };
      });

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        sku: product.sku,
        basePrice,
        effectiveSalePrice,
        saleBadgeText: product.saleBadgeText ?? (effectiveSale ? this.formatSaleBadge(effectiveSale) : null),
        images: product.images,
        category: product.category,
        minOrderQty: product.minOrderQty,
        variants,
      };
    });

    return {
      storeId: store.id,
      storeName: store.name,
      avgPrepTimeMinutes: store.avgPrepTimeMinutes,
      items: menu,
    };
  }

  // ── GET /customer/categories ───────────────────────────────────────────────

  async getCategories() {
    return this.prisma.category.findMany({
      where: { parentCategoryId: null, isActive: true, deletedAt: null },
      include: {
        children: {
          where: { isActive: true, deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // ── Open / Closed Helpers ──────────────────────────────────────────────────

  private async checkIfStoreIsOpen(storeId: string, isPaused: boolean): Promise<boolean> {
    if (isPaused) return false;

    const [hours, exceptions] = await Promise.all([
      this.prisma.storeOperatingHour.findMany({
        where: { storeId, deletedAt: null },
      }),
      this.prisma.storeHourException.findMany({
        where: { storeId, deletedAt: null },
      }),
    ]);

    return this.computeIsOpenStatus(isPaused, hours, exceptions);
  }

  private computeIsOpenStatus(
    isPaused: boolean,
    hours: { dayOfWeek: number; openTime: string | null; closeTime: string | null; isClosed: boolean }[],
    exceptions: { exceptionDate: Date; isClosed: boolean; openTime: string | null; closeTime: string | null }[],
  ): boolean {
    if (isPaused) return false;

    const now = new Date();
    // Use local hours in IST
    const istTimeStr = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
    // Get the correct day of week in IST, not UTC
    const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const currentDay = istDate.getDay(); // 0 = Sunday, 1 = Monday...

    // 1. Check for today's exception
    const todayStr = now.toISOString().slice(0, 10);
    const todayException = exceptions.find(
      (e) => e.exceptionDate.toISOString().slice(0, 10) === todayStr,
    );

    if (todayException) {
      if (todayException.isClosed) return false;
      if (todayException.openTime && todayException.closeTime) {
        return (
          istTimeStr >= todayException.openTime &&
          istTimeStr <= todayException.closeTime
        );
      }
      return true;
    }

    // 2. Check weekly operating hours
    const daySchedule = hours.find((h) => h.dayOfWeek === currentDay);
    if (!daySchedule || daySchedule.isClosed) return false;

    if (daySchedule.openTime && daySchedule.closeTime) {
      return (
        istTimeStr >= daySchedule.openTime &&
        istTimeStr <= daySchedule.closeTime
      );
    }

    return true;
  }

  // ── Sale Resolution Helper (3-Tier Precedence) ─────────────────────────────

  private resolveEffectiveSale(
    product: { id: string; categoryId: string },
    storeId: string,
    activeSales: any[],
  ) {
    // Tier 1: Product-specific sale
    const productSale = activeSales.find((s) => s.productId === product.id);
    if (productSale) return productSale;

    // Tier 2: Store-specific sale
    const storeSale = activeSales.find(
      (s) => s.storeId === storeId && !s.productId,
    );
    if (storeSale) return storeSale;

    // Tier 3: Category-specific sale
    const categorySale = activeSales.find(
      (s) => s.categoryId === product.categoryId && !s.productId && !s.storeId,
    );
    if (categorySale) return categorySale;

    // Tier 4: Global sale (platform-wide)
    const globalSale = activeSales.find(
      (s) => !s.productId && !s.storeId && !s.categoryId,
    );
    if (globalSale) return globalSale;

    return null;
  }

  private calculateDiscountedPrice(price: number, sale: any): number {
    const val = Number(sale.discountValue);
    if (sale.discountType === DiscountType.PERCENT) {
      let discount = price * (val / 100);
      if (sale.maxDiscountAmount) {
        discount = Math.min(discount, Number(sale.maxDiscountAmount));
      }
      return Math.max(0, Math.round((price - discount) * 100) / 100);
    }
    // FLAT_AMOUNT
    return Math.max(0, Math.round((price - val) * 100) / 100);
  }

  private formatSaleBadge(sale: any): string {
    if (sale.discountType === DiscountType.PERCENT) {
      return `${Number(sale.discountValue)}% OFF`;
    }
    return `₹${Number(sale.discountValue)} OFF`;
  }
}
