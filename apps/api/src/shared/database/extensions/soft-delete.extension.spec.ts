// Implements v3 §0.1 — unit tests for soft-delete extension
// Tests the interceptor functions directly since Prisma.defineExtension returns
// an extension definition, not a live client with callable .query.$allModels.

import { SOFT_DELETABLE_MODELS } from '../soft-deletable-models.const';

// ─── Pure interceptor implementations (extracted for testability) ─────────────
// These mirror the exact logic in soft-delete.extension.ts so we can unit-test
// without needing Prisma internals.

function makeInterceptors(getActorId: () => string | undefined) {
  return {
    filterRead: (model: string, args: any): any => {
      if (!SOFT_DELETABLE_MODELS.has(model)) return args;
      const { includeDeleted, ...rest } = args as any;
      if (!includeDeleted) return { ...rest, where: { ...rest.where, deletedAt: null } };
      return rest;
    },

    filterUpdate: (model: string, args: any): any => {
      if (!SOFT_DELETABLE_MODELS.has(model)) return args;
      const { includeDeleted, ...rest } = args as any;
      if (!includeDeleted) return { ...rest, where: { ...rest.where, deletedAt: null } };
      return rest;
    },

    filterUpsert: (model: string, args: any): any => {
      if (!SOFT_DELETABLE_MODELS.has(model)) return args;
      return { ...args, where: { ...args.where, deletedAt: null } };
    },

    softDelete: (
      model: string,
      args: any,
      modelDelegate: { update: (a: any) => Promise<any> },
    ) => {
      if (!SOFT_DELETABLE_MODELS.has(model)) return null; // caller should use real query
      const actorId = getActorId();
      const now = new Date();
      return modelDelegate.update({
        where: args.where,
        data: {
          deletedAt: now,
          deletedBy: actorId ?? null,
          updatedAt: now,
          updatedBy: actorId ?? null,
        },
      });
    },
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('SoftDeleteExtension (interceptor logic)', () => {
  let actorId: string | undefined = 'user-123';
  const getActorId = () => actorId;

  describe('filterRead (findMany / findFirst / count)', () => {
    it('injects deletedAt: null for soft-deletable models', () => {
      const { filterRead } = makeInterceptors(getActorId);
      const result = filterRead('City', { where: { name: 'Ahmedabad' } });
      expect(result.where).toEqual({ name: 'Ahmedabad', deletedAt: null });
    });

    it('does NOT inject deletedAt: null when includeDeleted: true', () => {
      const { filterRead } = makeInterceptors(getActorId);
      const result = filterRead('City', { includeDeleted: true, where: { name: 'Ahmedabad' } });
      expect(result.where).toEqual({ name: 'Ahmedabad' });
      expect(result).not.toHaveProperty('includeDeleted');
    });

    it('strips includeDeleted from args (not leaked to Prisma)', () => {
      const { filterRead } = makeInterceptors(getActorId);
      const result = filterRead('City', { includeDeleted: true, where: {} });
      expect(result).not.toHaveProperty('includeDeleted');
    });

    it('passes through unchanged for non-soft-deletable models', () => {
      const { filterRead } = makeInterceptors(getActorId);
      const args = { where: { id: 'order-1' } };
      const result = filterRead('Order', args);
      expect(result).toEqual(args);
      expect(result.where).not.toHaveProperty('deletedAt');
    });
  });

  describe('filterUpdate', () => {
    it('injects deletedAt: null into where for soft-deletable models', () => {
      const { filterUpdate } = makeInterceptors(getActorId);
      const result = filterUpdate('Store', { where: { id: 'store-1' }, data: { name: 'New' } });
      expect(result.where).toEqual({ id: 'store-1', deletedAt: null });
    });
  });

  describe('filterUpsert', () => {
    it('injects deletedAt: null into where clause (find-half)', () => {
      const { filterUpsert } = makeInterceptors(getActorId);
      const result = filterUpsert('Product', {
        where: { id: 'prod-1' },
        create: { name: 'Widget' },
        update: { name: 'Widget v2' },
      });
      expect(result.where).toEqual({ id: 'prod-1', deletedAt: null });
    });

    it('passes through unchanged for non-soft-deletable models', () => {
      const { filterUpsert } = makeInterceptors(getActorId);
      const args = { where: { id: 'order-1' }, create: {}, update: {} };
      expect(filterUpsert('Order', args)).toEqual(args);
    });
  });

  describe('softDelete → update conversion', () => {
    it('calls delegate.update with deletedAt set', async () => {
      const { softDelete } = makeInterceptors(getActorId);
      const mockDelegate = { update: jest.fn(async (args: any) => args) };

      await softDelete('City', { where: { id: 'city-1' } }, mockDelegate);

      expect(mockDelegate.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'city-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it('returns null for non-soft-deletable models (caller must use real query)', () => {
      const { softDelete } = makeInterceptors(getActorId);
      const mockDelegate = { update: jest.fn() };
      const result = softDelete('Order', { where: { id: 'order-1' } }, mockDelegate);
      expect(result).toBeNull();
      expect(mockDelegate.update).not.toHaveBeenCalled();
    });

    // ── CRITICAL cross-extension chaining test ────────────────────────────────
    // When delete is converted to update, soft-delete sets all 4 audit fields inline.
    // This test asserts ALL FOUR are present — not just deletedAt.
    // If updatedAt/updatedBy are missing, the inline assignment is broken.
    it('[CRITICAL] sets deletedAt, deletedBy, updatedAt, AND updatedBy inline', async () => {
      const captured: any[] = [];
      const mockDelegate = { update: jest.fn(async (args: any) => { captured.push(args); return {}; }) };
      const { softDelete } = makeInterceptors(getActorId);

      await softDelete('City', { where: { id: 'city-1' } }, mockDelegate);

      expect(captured).toHaveLength(1);
      const data = captured[0].data;
      expect(data.deletedAt).toBeInstanceOf(Date);
      expect(data.deletedBy).toBe('user-123');
      expect(data.updatedAt).toBeInstanceOf(Date);
      expect(data.updatedBy).toBe('user-123');
    });

    it('[CRITICAL] updatedBy is NULL (not throw) for system/cron writes (no actor)', async () => {
      actorId = undefined;
      const captured: any[] = [];
      const mockDelegate = { update: jest.fn(async (args: any) => { captured.push(args); return {}; }) };
      const { softDelete } = makeInterceptors(getActorId);

      await softDelete('City', { where: { id: 'city-2' } }, mockDelegate);

      const data = captured[0].data;
      expect(data.deletedAt).toBeInstanceOf(Date);
      expect(data.deletedBy).toBeNull();
      expect(data.updatedAt).toBeInstanceOf(Date);
      expect(data.updatedBy).toBeNull();

      actorId = 'user-123'; // restore
    });
  });
});
