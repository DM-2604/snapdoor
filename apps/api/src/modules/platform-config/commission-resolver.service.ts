// Implements v3 §0.3 — Commission resolution precedence (5-tier)
//
// Tier precedence (highest to lowest):
//   1. Store-specific rule    (storeId set)
//   2. Zone-specific rule     (zoneId set, storeId null)
//   3. Category-specific rule (categoryId set, zoneId/storeId null)
//   4. City default rule      (cityId set, all else null)
//   5. Platform global rule   (all four scope columns null) — seeded at boot
//
// Within each tier: rows where effectiveFrom <= now AND (effectiveTo IS NULL OR effectiveTo > now)
// are eligible. Ties broken by most recent createdAt.
//
// FIXME:COMMISSION_GUARD — Store.effectiveCommissionPercent must only be written via
// CommissionResolverService.applyEffectiveRateToStore(). When store-catalog module is built,
// add a runtime assertion at any store update path that touches this field to enforce this rule.

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';

export interface CommissionContext {
  storeId?: string;
  zoneId?: string;
  categoryId?: string;
  cityId?: string;
}

@Injectable()
export class CommissionResolverService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve the effective commission percentage for a given context,
   * walking down the 5 tiers until a matching rule is found.
   * Throws NotFoundException if no rule exists at any tier (should not happen
   * in a correctly seeded DB — tier 5 platform global is always present).
   */
  async resolve(ctx: CommissionContext): Promise<number> {
    const now = new Date();
    const effectiveWindow: Prisma.CommissionRuleWhereInput = {
      effectiveFrom: { lte: now },
      OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }],
      deletedAt: null,
    };

    // Tier 1: Store-specific
    if (ctx.storeId) {
      const rule = await this.findBestRule({
        ...effectiveWindow,
        storeId: ctx.storeId,
      });
      if (rule) return Number(rule.commissionPercent);
    }

    // Tier 2: Zone-specific
    if (ctx.zoneId) {
      const rule = await this.findBestRule({
        ...effectiveWindow,
        zoneId: ctx.zoneId,
        storeId: null,
      });
      if (rule) return Number(rule.commissionPercent);
    }

    // Tier 3: Category-specific
    if (ctx.categoryId) {
      const rule = await this.findBestRule({
        ...effectiveWindow,
        categoryId: ctx.categoryId,
        zoneId: null,
        storeId: null,
      });
      if (rule) return Number(rule.commissionPercent);
    }

    // Tier 4: City default
    if (ctx.cityId) {
      const rule = await this.findBestRule({
        ...effectiveWindow,
        cityId: ctx.cityId,
        categoryId: null,
        zoneId: null,
        storeId: null,
      });
      if (rule) return Number(rule.commissionPercent);
    }

    // Tier 5: Platform global (seeded — all scope columns null)
    const global = await this.findBestRule({
      ...effectiveWindow,
      cityId: null,
      categoryId: null,
      zoneId: null,
      storeId: null,
    });
    if (global) return Number(global.commissionPercent);

    throw new NotFoundException(
      'No commission rule found for context — ensure the platform global default row is seeded',
    );
  }

  /**
   * Persist the resolved rate back to Store.effectiveCommissionPercent.
   * This is the ONLY authorised path for writing to that field.
   * See FIXME:COMMISSION_GUARD above.
   */
  async applyEffectiveRateToStore(storeId: string): Promise<number> {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId },
      select: { cityId: true, zoneId: true, businessCategoryId: true },
    });
    if (!store) throw new NotFoundException(`Store ${storeId} not found`);

    const rate = await this.resolve({
      storeId,
      zoneId: store.zoneId ?? undefined,
      categoryId: store.businessCategoryId,
      cityId: store.cityId,
    });

    // FIXME:COMMISSION_GUARD — This is the ONLY place effectiveCommissionPercent may be written.
    await this.prisma.store.update({
      where: { id: storeId },
      data: { effectiveCommissionPercent: rate },
    });

    return rate;
  }

  private async findBestRule(
    where: Prisma.CommissionRuleWhereInput,
  ): Promise<{ commissionPercent: Prisma.Decimal } | null> {
    return this.prisma.commissionRule.findFirst({
      where,
      orderBy: { createdAt: 'desc' }, // tiebreak: most recently created wins
      select: { commissionPercent: true },
    });
  }
}
