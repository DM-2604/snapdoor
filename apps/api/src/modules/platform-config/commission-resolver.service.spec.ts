// Implements v3 §0.3 — Unit tests for CommissionResolverService
// Covers: all 5 tiers, tier fallthrough, effectiveFrom/effectiveTo window boundaries,
// createdAt tiebreak, and missing-global-rule error.

import { NotFoundException } from '@nestjs/common';
import { CommissionResolverService, CommissionContext } from './commission-resolver.service';

// ─── Mock PrismaService ───────────────────────────────────────────────────────

function buildMockPrisma(findFirstImpl: (args: any) => any) {
  return {
    commissionRule: {
      findFirst: jest.fn(findFirstImpl),
    },
    store: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  } as any;
}

function makeRule(percent: number, createdAt = new Date()) {
  return { commissionPercent: { toFixed: () => percent.toString(), valueOf: () => percent } };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CommissionResolverService', () => {
  const ctx: CommissionContext = {
    storeId: 'store-1',
    zoneId: 'zone-1',
    categoryId: 'cat-1',
    cityId: 'city-1',
  };

  describe('Tier 1 — store-specific rule', () => {
    it('returns store-specific rate when storeId matches', async () => {
      const prisma = buildMockPrisma(async ({ where }: any) => {
        if (where.storeId === 'store-1') return { commissionPercent: 8 };
        return null;
      });
      const svc = new CommissionResolverService(prisma);
      const rate = await svc.resolve(ctx);
      expect(rate).toBe(8);
    });
  });

  describe('Tier 2 — zone-specific rule', () => {
    it('falls through to zone when no store rule matches', async () => {
      const prisma = buildMockPrisma(async ({ where }: any) => {
        if (where.storeId !== undefined && where.storeId !== null) return null; // tier 1 miss
        if (where.zoneId === 'zone-1') return { commissionPercent: 7 };
        return null;
      });
      const svc = new CommissionResolverService(prisma);
      const rate = await svc.resolve(ctx);
      expect(rate).toBe(7);
    });
  });

  describe('Tier 3 — category-specific rule', () => {
    it('falls through to category when tiers 1+2 miss', async () => {
      const prisma = buildMockPrisma(async ({ where }: any) => {
        if (where.storeId !== undefined && where.storeId !== null) return null;
        if (where.zoneId !== undefined && where.zoneId !== null) return null;
        if (where.categoryId === 'cat-1') return { commissionPercent: 6 };
        return null;
      });
      const svc = new CommissionResolverService(prisma);
      const rate = await svc.resolve(ctx);
      expect(rate).toBe(6);
    });
  });

  describe('Tier 4 — city default rule', () => {
    it('falls through to city when tiers 1-3 miss', async () => {
      const prisma = buildMockPrisma(async ({ where }: any) => {
        if (where.storeId !== undefined && where.storeId !== null) return null;
        if (where.zoneId !== undefined && where.zoneId !== null) return null;
        if (where.categoryId !== undefined && where.categoryId !== null) return null;
        if (where.cityId === 'city-1') return { commissionPercent: 5.5 };
        return null;
      });
      const svc = new CommissionResolverService(prisma);
      const rate = await svc.resolve(ctx);
      expect(rate).toBe(5.5);
    });
  });

  describe('Tier 5 — platform global rule', () => {
    it('falls through to global when all tiers miss', async () => {
      const prisma = buildMockPrisma(async ({ where }: any) => {
        if (where.storeId !== undefined && where.storeId !== null) return null;
        if (where.zoneId !== undefined && where.zoneId !== null) return null;
        if (where.categoryId !== undefined && where.categoryId !== null) return null;
        if (where.cityId !== undefined && where.cityId !== null) return null;
        // Global: all four null
        return { commissionPercent: 6 };
      });
      const svc = new CommissionResolverService(prisma);
      const rate = await svc.resolve(ctx);
      expect(rate).toBe(6);
    });

    it('throws NotFoundException when no global rule exists', async () => {
      const prisma = buildMockPrisma(async () => null);
      const svc = new CommissionResolverService(prisma);
      await expect(svc.resolve(ctx)).rejects.toThrow(NotFoundException);
    });
  });

  describe('effectiveFrom / effectiveTo window', () => {
    it('passes effectiveFrom lte:now and effectiveTo null-or-gt:now in where clause', async () => {
      const findFirst = jest.fn(async () => ({ commissionPercent: 6 }));
      const prisma = { commissionRule: { findFirst }, store: { findFirst: jest.fn(), update: jest.fn() } } as any;
      const svc = new CommissionResolverService(prisma);
      await svc.resolve({ storeId: 'store-1' });

      const calledWhere = (findFirst.mock.calls as any[])[0][0].where;
      expect(calledWhere.effectiveFrom).toMatchObject({ lte: expect.any(Date) });
      expect(calledWhere.OR).toEqual([
        { effectiveTo: null },
        { effectiveTo: { gt: expect.any(Date) } },
      ]);
    });
  });

  describe('createdAt tiebreak', () => {
    it('passes orderBy: { createdAt: desc } to findFirst', async () => {
      const findFirst = jest.fn(async () => ({ commissionPercent: 6 }));
      const prisma = { commissionRule: { findFirst }, store: { findFirst: jest.fn(), update: jest.fn() } } as any;
      const svc = new CommissionResolverService(prisma);
      await svc.resolve({ storeId: 'store-1' });

      const calledArgs = (findFirst.mock.calls as any[])[0][0];
      expect(calledArgs?.orderBy).toEqual({ createdAt: 'desc' });
    });
  });

  describe('context without storeId/zoneId/categoryId', () => {
    it('skips tiers 1-3 and goes to city+global when only cityId provided', async () => {
      const findFirst = jest.fn(async ({ where }: any) => {
        if (where.cityId === 'city-only') return { commissionPercent: 4 };
        return null;
      });
      const prisma = { commissionRule: { findFirst }, store: { findFirst: jest.fn(), update: jest.fn() } } as any;
      const svc = new CommissionResolverService(prisma);
      const rate = await svc.resolve({ cityId: 'city-only' });
      expect(rate).toBe(4);
      // Should only have called findFirst twice (tier 4 + would stop there)
      expect(findFirst).toHaveBeenCalledTimes(1);
    });
  });
});
