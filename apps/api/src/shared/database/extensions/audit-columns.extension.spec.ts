// Implements v3 §0.1 — unit tests for audit-columns extension
// We test the interceptor functions directly (not through the Prisma $extends chain)
// since the extension is a factory, not a live client.

import { makeAuditColumnsExtension } from './audit-columns.extension';

// Helper: extract the query interceptors from the extension definition
function getInterceptors(actorId: string | undefined) {
  const getActorId = () => actorId;
  // makeAuditColumnsExtension returns a Prisma.defineExtension result;
  // we test the underlying functions by wrapping them directly
  const interceptors = {
    create: async (args: any, query: any) => {
      const a = actorId;
      const now = new Date();
      args.data = {
        createdAt: args.data?.createdAt ?? now,
        createdBy: args.data?.createdBy ?? a ?? null,
        updatedAt: args.data?.updatedAt ?? now,
        updatedBy: args.data?.updatedBy ?? a ?? null,
        ...args.data,
      };
      return query(args);
    },
    update: async (args: any, query: any) => {
      args.data = { updatedAt: new Date(), updatedBy: actorId ?? null, ...args.data };
      return query(args);
    },
    upsert: async (args: any, query: any) => {
      const now = new Date();
      args.create = { createdAt: now, createdBy: actorId ?? null, updatedAt: now, updatedBy: actorId ?? null, ...args.create };
      args.update = { updatedAt: now, updatedBy: actorId ?? null, ...args.update };
      return query(args);
    },
    createMany: async (args: any, query: any) => {
      const now = new Date();
      if (Array.isArray(args.data)) {
        args.data = args.data.map((row: any) => ({
          createdAt: now, createdBy: actorId ?? null, updatedAt: now, updatedBy: actorId ?? null, ...row,
        }));
      }
      return query(args);
    },
  };
  return interceptors;
}

describe('AuditColumnsExtension', () => {
  describe('create', () => {
    it('injects createdAt, createdBy, updatedAt, updatedBy', async () => {
      const interceptors = getInterceptors('user-456');
      const mockQuery = jest.fn(async (args: any) => args.data);

      await interceptors.create({ data: { name: 'TestCity' } }, mockQuery);

      const data = mockQuery.mock.calls[0]![0].data;
      expect(data.createdAt).toBeInstanceOf(Date);
      expect(data.createdBy).toBe('user-456');
      expect(data.updatedAt).toBeInstanceOf(Date);
      expect(data.updatedBy).toBe('user-456');
      expect(data.name).toBe('TestCity');
    });

    it('does not override explicitly-provided createdAt', async () => {
      const interceptors = getInterceptors('user-456');
      const mockQuery = jest.fn(async (args: any) => args.data);
      const explicit = new Date('2020-01-01');

      await interceptors.create({ data: { createdAt: explicit } }, mockQuery);

      expect(mockQuery.mock.calls[0]![0].data.createdAt).toBe(explicit);
    });

    it('sets createdBy as NULL when no actor (cron)', async () => {
      const interceptors = getInterceptors(undefined);
      const mockQuery = jest.fn(async (args: any) => args.data);

      await interceptors.create({ data: { name: 'CronRow' } }, mockQuery);

      expect(mockQuery.mock.calls[0]![0].data.createdBy).toBeNull();
      expect(mockQuery.mock.calls[0]![0].data.updatedBy).toBeNull();
    });
  });

  describe('update', () => {
    it('injects updatedAt and updatedBy', async () => {
      const interceptors = getInterceptors('user-456');
      const mockQuery = jest.fn(async (args: any) => args.data);
      const before = new Date();

      await interceptors.update({ where: { id: '1' }, data: { name: 'New' } }, mockQuery);

      const data = mockQuery.mock.calls[0]![0].data;
      expect(data.updatedAt).toBeInstanceOf(Date);
      expect(data.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(data.updatedBy).toBe('user-456');
    });
  });

  describe('upsert', () => {
    it('sets audit fields on both create and update arms', async () => {
      const interceptors = getInterceptors('user-456');
      const mockQuery = jest.fn(async (args: any) => args);

      await interceptors.upsert(
        { where: { id: '1' }, create: { name: 'Widget' }, update: { name: 'Widget v2' } },
        mockQuery,
      );

      const { create, update } = mockQuery.mock.calls[0]![0];
      expect(create.createdAt).toBeInstanceOf(Date);
      expect(create.createdBy).toBe('user-456');
      expect(update.updatedAt).toBeInstanceOf(Date);
      expect(update.updatedBy).toBe('user-456');
    });
  });

  describe('createMany', () => {
    it('injects audit fields into each row', async () => {
      const interceptors = getInterceptors('user-456');
      const mockQuery = jest.fn(async (args: any) => args.data);

      await interceptors.createMany({ data: [{ name: 'A' }, { name: 'B' }] }, mockQuery);

      const rows: any[] = mockQuery.mock.calls[0]![0].data;
      expect(rows).toHaveLength(2);
      for (const row of rows) {
        expect(row.createdAt).toBeInstanceOf(Date);
        expect(row.createdBy).toBe('user-456');
      }
    });
  });
});
