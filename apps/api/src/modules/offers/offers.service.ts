// apps/api/src/modules/offers/offers.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Offer, OfferStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

// ── Internal types ──────────────────────────────────────────────────────────

export interface CartItemInput {
  productVariantId: string;
  productId: string;
  categoryId: string;
  quantity: number;
  // Accept Prisma.Decimal or plain number — callers from order.service pass Decimal
  unitPrice: number | Prisma.Decimal;
}

export interface OfferEvaluationResult {
  appliedOffer: {
    offerId: string;
    title: string;
    discountAmount: number;
    snapshot: Record<string, unknown>;
  } | null;
  lineItemDiscounts: { variantId: string; discountAmount: number }[];
  totalDiscount: number;
}

interface EvaluatedOffer {
  offer: OfferWithJoins;
  discount: number;
}

type OfferWithJoins = Prisma.OfferGetPayload<{
  include: { triggerProducts: true; triggerCategories: true };
}>;

export interface ListOffersQuery {
  status?: OfferStatus;
  page?: number;
  limit?: number;
}

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Evaluation ──────────────────────────────────────────────────────────

  async evaluateOffersForCart(
    storeId: string,
    cartItems: CartItemInput[],
    channel: 'APP' | 'POS',
    couponCode?: string,
  ): Promise<OfferEvaluationResult> {
    const now = new Date();

    const offers = await this.prisma.offer.findMany({
      where: {
        storeId,
        isActive: true,
        status: OfferStatus.ACTIVE,
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gte: now } }],
        deletedAt: null,
        ...(channel === 'APP' ? { appliesToApp: true } : { appliesToPos: true }),
      },
      include: { triggerProducts: true, triggerCategories: true },
    });

    const cartSubtotal = cartItems.reduce(
      (sum, i) => sum + Number(i.unitPrice) * i.quantity,
      0,
    );

    // Auto-offers
    const candidates: EvaluatedOffer[] = [];
    for (const offer of offers) {
      if (offer.couponCode) continue;
      if (!this.checkTrigger(offer, cartItems, cartSubtotal)) continue;
      const discount = this.calculateDiscount(offer, cartItems, cartSubtotal);
      if (discount > 0) candidates.push({ offer, discount });
    }

    candidates.sort((a, b) => b.discount - a.discount);
    let winner = candidates[0] ?? null;

    // Coupon override
    if (couponCode) {
      const couponOffer = offers.find((o: OfferWithJoins) => o.couponCode === couponCode);
      if (couponOffer && this.checkTrigger(couponOffer, cartItems, cartSubtotal)) {
        const couponDiscount = this.calculateDiscount(couponOffer, cartItems, cartSubtotal);
        if (!winner || couponDiscount > winner.discount) {
          winner = { offer: couponOffer, discount: couponDiscount };
        }
      }
    }

    if (!winner) {
      return { appliedOffer: null, lineItemDiscounts: [], totalDiscount: 0 };
    }

    const lineItemDiscounts = this.buildLineItemDiscounts(winner.offer, cartItems, winner.discount);

    return {
      appliedOffer: {
        offerId: winner.offer.id,
        title: winner.offer.title,
        discountAmount: winner.discount,
        snapshot: {
          offerType: winner.offer.offerType,
          rewardType: winner.offer.rewardType,
          rewardValue: winner.offer.rewardValue,
        },
      },
      lineItemDiscounts,
      totalDiscount: winner.discount,
    };
  }

  private checkTrigger(
    offer: OfferWithJoins,
    cartItems: CartItemInput[],
    subtotal: number,
  ): boolean {
    if (offer.triggerIsEntireStore) return true;

    if (offer.triggerMinCartValue && subtotal < Number(offer.triggerMinCartValue)) return false;

    if (offer.triggerProducts.length > 0) {
      const ids = new Set(offer.triggerProducts.map((t) => t.productId));
      if (!cartItems.some((i) => ids.has(i.productId))) return false;
    }

    if (offer.triggerCategories.length > 0) {
      const ids = new Set(offer.triggerCategories.map((t) => t.categoryId));
      if (!cartItems.some((i) => ids.has(i.categoryId))) return false;
    }

    if (offer.offerType === 'BUY_X_GET_Y_FREE' && offer.triggerQuantity) {
      const qualifying = cartItems
        .filter(
          (i) =>
            offer.triggerProducts.length === 0 ||
            offer.triggerProducts.some((t) => t.productId === i.productId),
        )
        .reduce((sum, i) => sum + i.quantity, 0);
      if (qualifying < offer.triggerQuantity) return false;
    }

    return true;
  }

  private calculateDiscount(
    offer: OfferWithJoins,
    _cartItems: CartItemInput[],
    subtotal: number,
  ): number {
    let raw = 0;

    switch (offer.rewardType) {
      case 'PERCENT_OFF':
        raw = (subtotal * Number(offer.rewardValue ?? 0)) / 100;
        if (offer.maxDiscountAmount) raw = Math.min(raw, Number(offer.maxDiscountAmount));
        break;
      case 'FLAT_OFF':
        raw = Math.min(Number(offer.rewardValue ?? 0), subtotal);
        break;
      case 'FREE_ITEM':
        raw = Number(offer.rewardValue ?? 0) * (offer.rewardQuantity ?? 1);
        break;
      case 'FREE_SHIPPING':
        raw = 0; // waiver handled separately
        break;
    }

    return Math.max(0, raw);
  }

  private buildLineItemDiscounts(
    offer: OfferWithJoins,
    cartItems: CartItemInput[],
    totalDiscount: number,
  ): { variantId: string; discountAmount: number }[] {
    const eligible = cartItems.filter((i) => {
      if (offer.triggerIsEntireStore || offer.triggerProducts.length === 0) return true;
      return offer.triggerProducts.some((t) => t.productId === i.productId);
    });

    const eligibleSubtotal = eligible.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);
    if (eligibleSubtotal === 0) return [];

    return eligible.map((item) => ({
      variantId: item.productVariantId,
      discountAmount: parseFloat(
        ((totalDiscount * (Number(item.unitPrice) * item.quantity)) / eligibleSubtotal).toFixed(2),
      ),
    }));
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async createOffer(storeId: string, dto: CreateOfferDto): Promise<Offer> {
    const { triggerProductIds, triggerCategoryIds, ...rest } = dto;
    return this.prisma.offer.create({
      data: {
        ...rest,
        storeId,
        status: OfferStatus.ACTIVE,
        triggerProducts: triggerProductIds?.length
          ? { create: triggerProductIds.map((productId) => ({ productId })) }
          : undefined,
        triggerCategories: triggerCategoryIds?.length
          ? { create: triggerCategoryIds.map((categoryId) => ({ categoryId })) }
          : undefined,
      },
      include: { triggerProducts: true, triggerCategories: true },
    });
  }

  async updateOffer(storeId: string, offerId: string, dto: UpdateOfferDto): Promise<Offer> {
    const offer = await this.prisma.offer.findFirst({ where: { id: offerId, storeId, deletedAt: null } });
    if (!offer) throw new NotFoundException('Offer not found');

    const { triggerProductIds, triggerCategoryIds, ...rest } = dto;

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (triggerProductIds !== undefined) {
        await tx.offerTriggerProduct.deleteMany({ where: { offerId } });
        if (triggerProductIds.length > 0) {
          await tx.offerTriggerProduct.createMany({
            data: triggerProductIds.map((productId) => ({ offerId, productId })),
          });
        }
      }
      if (triggerCategoryIds !== undefined) {
        await tx.offerTriggerCategory.deleteMany({ where: { offerId } });
        if (triggerCategoryIds.length > 0) {
          await tx.offerTriggerCategory.createMany({
            data: triggerCategoryIds.map((categoryId) => ({ offerId, categoryId })),
          });
        }
      }
    });

    return this.prisma.offer.update({
      where: { id: offerId },
      data: rest,
      include: { triggerProducts: true, triggerCategories: true },
    });
  }

  async toggleOffer(storeId: string, offerId: string, isActive: boolean): Promise<Offer> {
    const offer = await this.prisma.offer.findFirst({ where: { id: offerId, storeId, deletedAt: null } });
    if (!offer) throw new NotFoundException('Offer not found');
    return this.prisma.offer.update({
      where: { id: offerId },
      data: { isActive, status: isActive ? OfferStatus.ACTIVE : OfferStatus.PAUSED },
    });
  }

  async listOffers(storeId: string, query: ListOffersQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.OfferWhereInput = {
      storeId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
    };

    const [offers, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
        include: { triggerProducts: true, triggerCategories: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.offer.count({ where }),
    ]);

    return { offers, total, page, limit };
  }

  async getOfferById(storeId: string, offerId: string): Promise<Offer> {
    const offer = await this.prisma.offer.findFirst({
      where: { id: offerId, storeId, deletedAt: null },
      include: { triggerProducts: true, triggerCategories: true },
    });
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  async deleteOffer(storeId: string, offerId: string): Promise<void> {
    const offer = await this.prisma.offer.findFirst({ where: { id: offerId, storeId, deletedAt: null } });
    if (!offer) throw new NotFoundException('Offer not found');
    await this.prisma.offer.update({
      where: { id: offerId },
      data: { deletedAt: new Date(), isActive: false, status: OfferStatus.EXPIRED },
    });
  }
}
