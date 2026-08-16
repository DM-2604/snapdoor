// Implements v3 §0.1 — audit-columns Prisma Client Extension
//
// Auto-populates createdAt/createdBy on create and updatedAt/updatedBy on
// all write operations. Actor id is pulled from CLS (AsyncLocalStorage) —
// returns undefined for cron/system writes (stored as NULL in DB, not an error).
//
// DOES NOT intercept delete/deleteMany — soft-delete extension handles those
// and sets all four audit fields inline to avoid double-intercept issues.

import { Prisma } from '@prisma/client';

const modelFields = new Map<string, Set<string>>();
Prisma.dmmf.datamodel.models.forEach((m) => {
  modelFields.set(m.name, new Set(m.fields.map((f) => f.name)));
});

export function makeAuditColumnsExtension(getActorId: () => string | undefined) {
  return Prisma.defineExtension({
    name: 'audit-columns',
    query: {
      $allModels: {
        async create({ model, args, query }: any) {
          const fields = modelFields.get(model);
          if (!fields) return query(args);
          const actorId = getActorId();
          const now = new Date();
          args.data = { ...args.data };
          if (fields.has('createdAt')) args.data.createdAt = args.data.createdAt ?? now;
          if (fields.has('createdBy')) args.data.createdBy = args.data.createdBy ?? actorId ?? null;
          if (fields.has('updatedAt')) args.data.updatedAt = args.data.updatedAt ?? now;
          if (fields.has('updatedBy')) args.data.updatedBy = args.data.updatedBy ?? actorId ?? null;
          return query(args);
        },

        async createMany({ model, args, query }: any) {
          const fields = modelFields.get(model);
          if (!fields) return query(args);
          const actorId = getActorId();
          const now = new Date();
          
          const injectFields = (row: any) => {
            const newRow = { ...row };
            if (fields.has('createdAt')) newRow.createdAt = newRow.createdAt ?? now;
            if (fields.has('createdBy')) newRow.createdBy = newRow.createdBy ?? actorId ?? null;
            if (fields.has('updatedAt')) newRow.updatedAt = newRow.updatedAt ?? now;
            if (fields.has('updatedBy')) newRow.updatedBy = newRow.updatedBy ?? actorId ?? null;
            return newRow;
          };

          if (Array.isArray(args.data)) {
            args.data = args.data.map(injectFields);
          } else {
            args.data = injectFields(args.data);
          }
          return query(args);
        },

        async update({ model, args, query }: any) {
          const fields = modelFields.get(model);
          if (!fields) return query(args);
          const actorId = getActorId();
          args.data = { ...args.data };
          if (fields.has('updatedAt')) args.data.updatedAt = new Date();
          if (fields.has('updatedBy')) args.data.updatedBy = actorId ?? null;
          return query(args);
        },

        async updateMany({ model, args, query }: any) {
          const fields = modelFields.get(model);
          if (!fields) return query(args);
          const actorId = getActorId();
          args.data = { ...args.data };
          if (fields.has('updatedAt')) args.data.updatedAt = new Date();
          if (fields.has('updatedBy')) args.data.updatedBy = actorId ?? null;
          return query(args);
        },

        async upsert({ model, args, query }: any) {
          const fields = modelFields.get(model);
          if (!fields) return query(args);
          const actorId = getActorId();
          const now = new Date();
          
          args.create = { ...args.create };
          if (fields.has('createdAt')) args.create.createdAt = now;
          if (fields.has('createdBy')) args.create.createdBy = actorId ?? null;
          if (fields.has('updatedAt')) args.create.updatedAt = now;
          if (fields.has('updatedBy')) args.create.updatedBy = actorId ?? null;

          args.update = { ...args.update };
          if (fields.has('updatedAt')) args.update.updatedAt = now;
          if (fields.has('updatedBy')) args.update.updatedBy = actorId ?? null;
          
          return query(args);
        },
      },
    },
  });
}
