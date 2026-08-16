import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  Inventory,
  InventoryAdjustment,
  InventoryAdjustmentReason,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { EventBusService } from '../../shared/events/event-bus.service';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  /**
   * Initialize inventory for a newly created product variant.
   */
  async initInventory(
    productVariantId: string,
    quantity = 0,
    lowStockThreshold = 5,
    autoDisableAtZero = true,
    actorUserId?: string,
    txClient?: Prisma.TransactionClient,
  ): Promise<Inventory> {
    const tx = txClient || this.prisma;
    const existing = await tx.inventory.findUnique({
      where: { productVariantId },
    });

    if (existing) {
      return existing;
    }

    const inventory = await tx.inventory.create({
      data: {
        productVariantId,
        quantity,
        lowStockThreshold,
        autoDisableAtZero,
        createdBy: actorUserId,
      },
    });

    if (quantity > 0) {
      await tx.inventoryAdjustment.create({
        data: {
          inventoryId: inventory.id,
          changeQty: quantity,
          previousQty: 0,
          newQty: quantity,
          reason: InventoryAdjustmentReason.RESTOCK,
          createdBy: actorUserId,
        },
      });
    }

    return inventory;
  }

  /**
   * Get single inventory record with variant details.
   */
  async getByVariantId(productVariantId: string) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { productVariantId, deletedAt: null },
      include: {
        productVariant: {
          include: {
            product: {
              select: { id: true, name: true, storeId: true, isActive: true },
            },
          },
        },
      },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory for variant ${productVariantId} not found`);
    }

    return inventory;
  }

  /**
   * List inventory balances scoped to a specific store with optional low-stock filter.
   */
  async getByStore(
    storeId: string,
    options: { lowStockOnly?: boolean; search?: string; page?: number; limit?: number } = {},
  ) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 50;

    let matchingInventoryIds: string[] | undefined;

    if (options.lowStockOnly) {
      const rawRes = await this.prisma.$queryRaw<any[]>`
        SELECT i.id
        FROM "inventory" i
        JOIN "product_variants" pv ON i."product_variant_id" = pv.id
        JOIN "products" p ON pv.product_id = p.id
        WHERE p.store_id = ${storeId}::uuid
          AND i.quantity <= i.low_stock_threshold
          AND i.deleted_at IS NULL
          AND pv.deleted_at IS NULL
          AND p.deleted_at IS NULL
      `;
      matchingInventoryIds = rawRes.map((row) => row.id);
    }

    const where: any = {
      deletedAt: null,
      ...(matchingInventoryIds ? { id: { in: matchingInventoryIds } } : {}),
      productVariant: {
        product: {
          storeId,
          deletedAt: null,
          ...(options.search
            ? {
                name: { contains: options.search, mode: 'insensitive' },
              }
            : {}),
        },
      },
    };

    const items = await this.prisma.inventory.findMany({
      where,
      include: {
        productVariant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                basePrice: true,
                isActive: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prisma.inventory.count({ where });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Perform stock adjustment (Restock, Correction, Damage, Manual).
   */
  async adjustStock(
    storeId: string,
    productVariantId: string,
    changeQty: number,
    reason: InventoryAdjustmentReason,
    relatedOrderId?: string,
    actorUserId?: string,
    txClient?: Prisma.TransactionClient,
  ): Promise<{ inventory: Inventory; adjustment: InventoryAdjustment }> {
    const runInTx = async (tx: any) => {
      // Row-locking read for concurrency safety
      const rawRows = await tx.$queryRaw<any[]>`
        SELECT * FROM "inventory"
        WHERE "product_variant_id" = ${productVariantId}::uuid
        FOR UPDATE
      `;
      
      if (!rawRows.length) {
        throw new NotFoundException(`Inventory for variant ${productVariantId} not found`);
      }

      const inventory = await tx.inventory.findFirst({
        where: { productVariantId, deletedAt: null },
        include: { productVariant: { include: { product: true } } },
      });

      if (!inventory) {
        throw new NotFoundException(`Inventory for variant ${productVariantId} not found`);
      }

      // Controller-level isolation fix: Verify ownership
      if (inventory.productVariant.product.storeId !== storeId) {
        throw new NotFoundException(`Inventory for variant ${productVariantId} not found`);
      }

      const previousQty = inventory.quantity;
      const newQty = previousQty + changeQty;

      if (newQty < 0) {
        throw new BadRequestException(
          `Insufficient stock for variant ${inventory.productVariant.variantName}. Available: ${previousQty}, Requested: ${Math.abs(changeQty)}`,
        );
      }

      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: newQty,
          updatedBy: actorUserId,
        },
      });
      const adjustment = await tx.inventoryAdjustment.create({
        data: {
          inventoryId: inventory.id,
          changeQty,
          previousQty,
          newQty,
          reason,
          relatedOrderId: relatedOrderId ?? null,
          createdBy: actorUserId,
        },
      });

      // Handle auto-disable at zero stock
      if (newQty === 0 && inventory.autoDisableAtZero) {
        this.logger.warn(
          `Stock reached 0 for variant ${productVariantId} — disabling variant`,
        );
        await tx.productVariant.update({
          where: { id: productVariantId },
          data: { isActive: false, updatedBy: actorUserId },
        });
      } else if (previousQty === 0 && newQty > 0 && inventory.autoDisableAtZero) {
        // Re-enable if rested from 0
        await tx.productVariant.update({
          where: { id: productVariantId },
          data: { isActive: true, updatedBy: actorUserId },
        });
      }

      // Low stock notification
      if (newQty <= inventory.lowStockThreshold && newQty > 0) {
        this.logger.log(
          `Low stock warning for variant ${productVariantId}: ${newQty} units remaining (threshold: ${inventory.lowStockThreshold})`,
        );
        this.eventBus.emit('inventory.low_stock', {
          productVariantId,
          quantity: newQty,
          threshold: inventory.lowStockThreshold,
        });
      }

      return { inventory: updatedInventory, adjustment };
    };

    return txClient ? runInTx(txClient) : this.prisma.$transaction(runInTx);
  }

  /**
   * Direct stock decrement for instant POS walk-in purchases.
   */
  async decrementDirectStock(
    storeId: string,
    productVariantId: string,
    quantity: number,
    relatedOrderId?: string,
    actorUserId?: string,
    txClient?: Prisma.TransactionClient,
  ) {
    return this.adjustStock(
      storeId,
      productVariantId,
      -Math.abs(quantity),
      InventoryAdjustmentReason.SALE,
      relatedOrderId,
      actorUserId,
      txClient,
    );
  }

  /**
   * Reserve inventory for an online (APP) order during checkout.
   */
  async reserveStock(
    productVariantId: string,
    quantity: number,
    actorUserId?: string,
    txClient?: Prisma.TransactionClient,
  ): Promise<Inventory> {
    const runInTx = async (tx: any) => {
      // Row-locking read
      const rawRows = await tx.$queryRaw<any[]>`
        SELECT * FROM "inventory"
        WHERE "product_variant_id" = ${productVariantId}::uuid
        FOR UPDATE
      `;
      if (!rawRows.length) {
        throw new NotFoundException(`Inventory for variant ${productVariantId} not found`);
      }

      const inventory = await tx.inventory.findFirst({
        where: { productVariantId, deletedAt: null },
        include: { productVariant: true },
      });

      if (!inventory) {
        throw new NotFoundException(`Inventory for variant ${productVariantId} not found`);
      }

      const available = inventory.quantity - inventory.reservedQuantity;
      if (available < quantity) {
        throw new BadRequestException(
          `Insufficient available stock for variant '${inventory.productVariant?.variantName ?? productVariantId}'. Available: ${available}, Requested: ${quantity}`,
        );
      }

      return tx.inventory.update({
        where: { id: inventory.id },
        data: {
          reservedQuantity: inventory.reservedQuantity + quantity,
          updatedBy: actorUserId,
        },
      });
    };

    return txClient ? runInTx(txClient) : this.prisma.$transaction(runInTx);
  }

  /**
   * Release reserved stock back to available pool when an order is cancelled or rejected.
   */
  async releaseReservedStock(
    productVariantId: string,
    quantity: number,
    actorUserId?: string,
    txClient?: Prisma.TransactionClient,
  ): Promise<Inventory | null> {
    const tx = txClient || this.prisma;
    const inventory = await tx.inventory.findFirst({
      where: { productVariantId, deletedAt: null },
    });

    if (!inventory) return null;

    const newReserved = Math.max(0, inventory.reservedQuantity - quantity);

    return tx.inventory.update({
      where: { id: inventory.id },
      data: {
        reservedQuantity: newReserved,
        updatedBy: actorUserId,
      },
    });
  }

  /**
   * Commit reserved stock upon order completion: decrements quantity and reservedQuantity,
   * records a SALE inventory adjustment, and emits stock events.
   */
  async commitReservedStock(
    productVariantId: string,
    quantity: number,
    relatedOrderId?: string,
    actorUserId?: string,
    txClient?: Prisma.TransactionClient,
  ): Promise<{ inventory: Inventory; adjustment: InventoryAdjustment }> {
    const runInTx = async (tx: any) => {
      // Row-locking read
      const rawRows = await tx.$queryRaw<any[]>`
        SELECT * FROM "inventory"
        WHERE "product_variant_id" = ${productVariantId}::uuid
        FOR UPDATE
      `;
      if (!rawRows.length) {
        throw new NotFoundException(`Inventory for variant ${productVariantId} not found`);
      }

      const inventory = await tx.inventory.findFirst({
        where: { productVariantId, deletedAt: null },
        include: { productVariant: true },
      });

      if (!inventory) {
        throw new NotFoundException(`Inventory for variant ${productVariantId} not found`);
      }

      const previousQty = inventory.quantity;
      const newQty = Math.max(0, previousQty - quantity);
      const newReservedQty = Math.max(0, inventory.reservedQuantity - quantity);

      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: newQty,
          reservedQuantity: newReservedQty,
          updatedBy: actorUserId,
        },
      });

      const adjustment = await tx.inventoryAdjustment.create({
        data: {
          inventoryId: inventory.id,
          changeQty: -quantity,
          previousQty,
          newQty,
          reason: InventoryAdjustmentReason.SALE,
          relatedOrderId: relatedOrderId ?? null,
          createdBy: actorUserId,
        },
      });

      // Handle auto-disable at zero stock
      if (newQty === 0 && inventory.autoDisableAtZero) {
        this.logger.warn(
          `Stock reached 0 for variant ${productVariantId} — disabling variant`,
        );
        await tx.productVariant.update({
          where: { id: productVariantId },
          data: { isActive: false, updatedBy: actorUserId },
        });
      }

      // Low stock notification
      if (newQty <= inventory.lowStockThreshold && newQty > 0) {
        this.logger.log(
          `Low stock warning for variant ${productVariantId}: ${newQty} units remaining (threshold: ${inventory.lowStockThreshold})`,
        );
        this.eventBus.emit('inventory.low_stock', {
          productVariantId,
          quantity: newQty,
          threshold: inventory.lowStockThreshold,
        });
      }

      return { inventory: updatedInventory, adjustment };
    };

    return txClient ? runInTx(txClient) : this.prisma.$transaction(runInTx);
  }

  /**
   * Get audit log history of inventory adjustments for a variant or store.
   */
  async getAdjustmentHistory(
    storeId: string,
    productVariantId: string,
    page = 1,
    limit = 20,
  ) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { productVariantId, deletedAt: null },
      include: { productVariant: { include: { product: true } } },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory for variant ${productVariantId} not found`);
    }

    if (inventory.productVariant.product.storeId !== storeId) {
      throw new NotFoundException(`Inventory for variant ${productVariantId} not found`);
    }

    const [items, total] = await Promise.all([
      this.prisma.inventoryAdjustment.findMany({
        where: { inventoryId: inventory.id },
        include: {
          actor: { select: { id: true, name: true, phoneNumber: true } },
          relatedOrder: { select: { id: true, orderNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.inventoryAdjustment.count({
        where: { inventoryId: inventory.id },
      }),
    ]);

    return { items, total, page, limit };
  }
}
