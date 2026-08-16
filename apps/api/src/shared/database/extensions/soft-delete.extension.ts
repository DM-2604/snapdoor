// Implements v3 §0.1 — soft-delete Prisma Client Extension
//
// Design notes:
// - Uses the $extends query-layer API (NOT the deprecated middleware API).
// - delete/deleteMany on soft-deletable models are converted to an UPDATE
//   against the BASE client (prisma._executeRaw / direct model access on `query.model`)
//   to avoid infinite recursion through the extension stack. Because of this,
//   updatedAt and updatedBy are set INLINE here — do NOT rely on the audit extension
//   re-intercepting this converted call.
// - upsert: deletedAt: null is injected into the `where` clause to prevent silently
//   resurrecting or mutating a soft-deleted row via the find-or-create path.
// - Non-soft-deletable models: delete/deleteMany pass through unchanged.

import { Prisma } from '@prisma/client';
import { SOFT_DELETABLE_MODELS } from '../soft-deletable-models.const';

type SoftDeleteArgs = {
  includeDeleted?: boolean;
};

export function makeSoftDeleteExtension(getActorId: () => string | undefined) {
  return Prisma.defineExtension((client) => {
    return client.$extends({
      name: 'soft-delete',
      query: {
        $allModels: {
          async findMany({ model, args, query }: any) {
            if (SOFT_DELETABLE_MODELS.has(model)) {
              const { includeDeleted, ...rest } = (args as any & SoftDeleteArgs);
              if (!includeDeleted) {
                args = { ...rest, where: { ...rest.where, deletedAt: null } };
              } else {
                args = rest;
              }
            }
            return query(args);
          },

          async findFirst({ model, args, query }: any) {
            if (SOFT_DELETABLE_MODELS.has(model)) {
              const { includeDeleted, ...rest } = (args as any & SoftDeleteArgs);
              if (!includeDeleted) {
                args = { ...rest, where: { ...rest.where, deletedAt: null } };
              } else {
                args = rest;
              }
            }
            return query(args);
          },

          async findFirstOrThrow({ model, args, query }: any) {
            if (SOFT_DELETABLE_MODELS.has(model)) {
              const { includeDeleted, ...rest } = (args as any & SoftDeleteArgs);
              if (!includeDeleted) {
                args = { ...rest, where: { ...rest.where, deletedAt: null } };
              } else {
                args = rest;
              }
            }
            return query(args);
          },

          async findUnique({ model, args, query }: any) {
            if (SOFT_DELETABLE_MODELS.has(model)) {
              const { includeDeleted, ...rest } = (args as any & SoftDeleteArgs);
              if (!includeDeleted) {
                // findUnique doesn't support arbitrary where — must use findFirst
                // We fall through to query() with args unchanged; the caller is
                // responsible for not querying soft-deleted rows via unique lookup.
                // For full protection, prefer findFirst over findUnique in services.
                args = rest;
              } else {
                args = rest;
              }
            }
            return query(args);
          },

          async findUniqueOrThrow({ model, args, query }: any) {
            if (SOFT_DELETABLE_MODELS.has(model)) {
              const { includeDeleted, ...rest } = (args as any & SoftDeleteArgs);
              args = rest;
            }
            return query(args);
          },

          async count({ model, args, query }: any) {
            if (SOFT_DELETABLE_MODELS.has(model)) {
              const { includeDeleted, ...rest } = (args as any & SoftDeleteArgs);
              if (!includeDeleted) {
                args = { ...rest, where: { ...rest.where, deletedAt: null } };
              } else {
                args = rest;
              }
            }
            return query(args);
          },

          async update({ model, args, query }: any) {
            if (SOFT_DELETABLE_MODELS.has(model)) {
              const { includeDeleted, ...rest } = (args as any & SoftDeleteArgs);
              if (!includeDeleted) {
                args = { ...rest, where: { ...rest.where, deletedAt: null } };
              } else {
                args = rest;
              }
            }
            return query(args);
          },

          async updateMany({ model, args, query }: any) {
            if (SOFT_DELETABLE_MODELS.has(model)) {
              const { includeDeleted, ...rest } = (args as any & SoftDeleteArgs);
              if (!includeDeleted) {
                args = { ...rest, where: { ...rest.where, deletedAt: null } };
              } else {
                args = rest;
              }
            }
            return query(args);
          },

          async upsert({ model, args, query }: any) {
            if (SOFT_DELETABLE_MODELS.has(model)) {
              // Inject deletedAt: null into the `where` clause (find-half).
              // This prevents matching a soft-deleted row and silently resurrecting it.
              args = {
                ...args,
                where: { ...args.where, deletedAt: null },
              };
            }
            return query(args);
          },

          async delete({ model, args, query }: any) {
            if (!SOFT_DELETABLE_MODELS.has(model)) {
              // Hard delete — pass through unchanged for append-only models.
              return query(args);
            }
            // Convert to a soft-delete update.
            // Set audit fields inline — cannot rely on the audit extension
            // picking up this converted call since we call the base client.
            const actorId = getActorId();
            const now = new Date();
            const modelDelegate = (client as any)[
              model.charAt(0).toLowerCase() + model.slice(1)
            ];
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

          async deleteMany({ model, args, query }: any) {
            if (!SOFT_DELETABLE_MODELS.has(model)) {
              return query(args);
            }
            const actorId = getActorId();
            const now = new Date();
            const modelDelegate = (client as any)[
              model.charAt(0).toLowerCase() + model.slice(1)
            ];
            return modelDelegate.updateMany({
              where: { ...args.where, deletedAt: null },
              data: {
                deletedAt: now,
                deletedBy: actorId ?? null,
                updatedAt: now,
                updatedBy: actorId ?? null,
              },
            });
          },
        },
      },
    });
  });
}
