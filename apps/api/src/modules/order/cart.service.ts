import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartStatus, StoreStatus } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { AddCartItemDto, MergeCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Private: shape builder ─────────────────────────────────────────────────

  /**
   * Transforms raw Prisma cart + items into the CartWithOffers shape the
   * frontend expects. All cart-mutating methods must return this shape.
   */
  private buildCartWithOffers(
    cart: {
      id: string;
      storeId: string;
      items: Array<{
        id: string;
        productVariantId: string;
        priceAtAdd: any;
        quantity: number;
        productVariant: {
          variantName: string;
          product: { name: string; gstRatePercent: any };
        };
      }>;
    },
    appliedOffer: { id: string; title: string; discountAmount: number } | null = null,
    totalDiscount = 0,
  ) {
    return {
      cart: {
        id: cart.id,
        storeId: cart.storeId,
        items: cart.items.map((item) => ({
          id: item.id,
          productVariantId: item.productVariantId,
          productName: item.productVariant.product.name,
          variantName: item.productVariant.variantName,
          priceAtTime: Number(item.priceAtAdd),
          gstRatePercent: Number(item.productVariant.product.gstRatePercent ?? 0),
          quantity: item.quantity,
        })),
      },
      appliedOffer,
      totalDiscount,
    };
  }

  // ── GET /cart ──────────────────────────────────────────────────────────────

  async getCart(customerId: string, storeId?: string) {
    const whereClause: any = {
      customerId,
      status: CartStatus.ACTIVE,
      deletedAt: null,
    };
    if (storeId) {
      whereClause.storeId = storeId;
    }

    const cart = await this.prisma.cart.findFirst({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      include: {
        items: {
          where: { deletedAt: null },
          include: {
            productVariant: {
              include: {
                product: {
                  select: {
                    name: true,
                    gstRatePercent: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) return null;

    return this.buildCartWithOffers(cart);
  }

  // ── POST /cart/items ───────────────────────────────────────────────────────

  async addItem(customerId: string, dto: AddCartItemDto) {
    // 1. Cross-store active cart check
    const activeCart = await this.prisma.cart.findFirst({
      where: { customerId, status: CartStatus.ACTIVE, deletedAt: null },
      include: { store: { select: { name: true } } },
    });

    if (activeCart && activeCart.storeId !== dto.storeId) {
      if (!dto.confirmClearOtherCart) {
        throw new ConflictException({
          statusCode: 409,
          error: 'Conflict',
          code: 'CROSS_STORE_CART_CONFLICT',
          message: `You already have items in your cart from "${activeCart.store.name}". Clear your existing cart to start a new one?`,
          activeStoreId: activeCart.storeId,
          activeStoreName: activeCart.store.name,
        });
      }
      // Customer confirmed clearing previous store cart
      await this.prisma.cart.update({
        where: { id: activeCart.id },
        data: { status: CartStatus.ABANDONED },
      });
    }

    // 2. Validate store
    const store = await this.prisma.store.findFirst({
      where: { id: dto.storeId, status: StoreStatus.LIVE, deletedAt: null },
    });
    if (!store) {
      throw new NotFoundException(`Store ${dto.storeId} not found or not currently active`);
    }

    // 3. Validate product variant & inventory
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: dto.productVariantId, isActive: true, deletedAt: null },
      include: {
        product: { select: { id: true, basePrice: true, isActive: true, storeId: true } },
        inventory: true,
      },
    });

    if (!variant || !variant.product.isActive || variant.product.storeId !== dto.storeId) {
      throw new NotFoundException(`Product variant not available in this store`);
    }

    const availableStock = variant.inventory
      ? Math.max(0, variant.inventory.quantity - variant.inventory.reservedQuantity)
      : 0;

    // 4. Find or create active cart for this store
    let cart = activeCart && activeCart.storeId === dto.storeId
      ? activeCart
      : await this.prisma.cart.create({
          data: {
            customerId,
            storeId: dto.storeId,
            status: CartStatus.ACTIVE,
          },
        });

    // 5. Check if item already exists in this cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productVariantId: dto.productVariantId, deletedAt: null },
    });

    const targetQuantity = existingItem ? existingItem.quantity + dto.quantity : dto.quantity;

    if (targetQuantity > availableStock) {
      throw new BadRequestException(
        `Requested quantity (${targetQuantity}) exceeds available stock (${availableStock})`,
      );
    }

    const priceAtAdd = variant.priceOverride ?? variant.product.basePrice;

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: targetQuantity,
          priceAtAdd,
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productVariantId: dto.productVariantId,
          quantity: dto.quantity,
          priceAtAdd,
        },
      });
    }

    return this.getCart(customerId, dto.storeId);
  }

  // ── PATCH /cart/items/:id ──────────────────────────────────────────────────

  async updateItem(customerId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, deletedAt: null },
      include: {
        cart: true,
        productVariant: {
          include: { inventory: true },
        },
      },
    });

    if (
      !item ||
      !item.cart ||
      item.cart.customerId !== customerId ||
      item.cart.status !== CartStatus.ACTIVE
    ) {
      throw new NotFoundException(`Cart item not found or cart inactive`);
    }

    const availableStock = item.productVariant?.inventory
      ? Math.max(
          0,
          item.productVariant.inventory.quantity -
            item.productVariant.inventory.reservedQuantity,
        )
      : 0;

    if (dto.quantity > availableStock) {
      throw new BadRequestException(
        `Requested quantity (${dto.quantity}) exceeds available stock (${availableStock})`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.getCart(customerId, item.cart.storeId);
  }

  // ── DELETE /cart/items/:id ─────────────────────────────────────────────────

  async removeItem(customerId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, deletedAt: null },
      include: { cart: true },
    });

    if (
      !item ||
      !item.cart ||
      item.cart.customerId !== customerId ||
      item.cart.status !== CartStatus.ACTIVE
    ) {
      throw new NotFoundException(`Cart item not found or cart inactive`);
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCart(customerId, item.cart.storeId);
  }

  // ── DELETE /cart ───────────────────────────────────────────────────────────

  async clearCart(customerId: string, storeId?: string) {
    const whereClause: any = {
      customerId,
      status: CartStatus.ACTIVE,
      deletedAt: null,
    };
    if (storeId) {
      whereClause.storeId = storeId;
    }

    const cart = await this.prisma.cart.findFirst({
      where: whereClause,
    });

    if (cart) {
      await this.prisma.cart.update({
        where: { id: cart.id },
        data: { status: CartStatus.ABANDONED },
      });
    }

    return { message: 'Cart cleared' };
  }

  // ── POST /cart/merge ───────────────────────────────────────────────────────

  async mergeCart(
    customerId: string,
    dto: MergeCartDto,
  ): Promise<ReturnType<typeof this.buildCartWithOffers> & { skippedItems: Array<{ productVariantId: string; reason: string }> }> {
    const skippedItems: Array<{ productVariantId: string; reason: string }> = [];

    await this.prisma.$transaction(async (tx) => {
      // 1. Find or create active cart for this store
      let cart = await tx.cart.findFirst({
        where: { customerId, storeId: dto.storeId, status: CartStatus.ACTIVE, deletedAt: null },
        include: { items: { where: { deletedAt: null } } },
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: { customerId, storeId: dto.storeId, status: CartStatus.ACTIVE },
          include: { items: true },
        });
      } else if (cart.items.length > 0) {
        // Clear stale items from a previous session so the cart reflects only
        // what the user intentionally added as a guest before logging in.
        await tx.cartItem.deleteMany({ where: { cartId: cart.id, deletedAt: null } });
        cart = { ...cart, items: [] };
      }

      // 2. Insert each incoming guest item fresh (no duplicates possible after clear)
      for (const incoming of dto.items) {
        // Fetch live price for this variant
        const variant = await tx.productVariant.findFirst({
          where: { id: incoming.productVariantId, isActive: true, deletedAt: null },
          include: { product: { select: { basePrice: true, name: true } } },
        });

        if (!variant) {
          // Item was deleted by store admin after guest added it
          skippedItems.push({ productVariantId: incoming.productVariantId, reason: 'UNAVAILABLE' });
          continue;
        }

        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productVariantId: incoming.productVariantId,
            quantity: incoming.quantity,
            priceAtAdd: variant.priceOverride ?? variant.product.basePrice,
          },
        });
      }
    });

    // Fetch merged cart in the correct shape (outside transaction for full includes)
    const result = await this.getCart(customerId, dto.storeId);
    return { ...(result ?? { cart: { id: '', storeId: dto.storeId, items: [] }, appliedOffer: null, totalDiscount: 0 }), skippedItems };
  }
}
