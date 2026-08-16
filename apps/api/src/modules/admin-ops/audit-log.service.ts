// Implements v3 §5b — Audit Log Service
//
// Append-only log of all admin actions.
// Called explicitly from: approve/reject/request-changes/document verify-reject/commission-rule-create.

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { AuditLog, Prisma } from '@prisma/client';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record an audit log entry.
   * @param actorUserId  UUID of the admin user performing the action
   * @param action       Verb string e.g. 'STORE_APPROVED', 'DOCUMENT_REJECTED'
   * @param entityType   Model name e.g. 'Store', 'Document'
   * @param entityId     UUID of the affected entity
   * @param before       Optional snapshot of the entity before the change
   * @param after        Optional snapshot of the entity after the change
   */
  async record(
    actorUserId: string | null,
    action: string,
    entityType: string,
    entityId: string,
    before?: Record<string, unknown> | null,
    after?: Record<string, unknown> | null,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    await client.auditLog.create({
      data: {
        actor: actorUserId ? { connect: { id: actorUserId } } : undefined,
        action,
        entityType,
        entityId,
        before: (before as any) ?? undefined,
        after: (after as any) ?? undefined,
      },
    });
  }

  /**
   * Paginated read of audit log entries with optional filters.
   * Used by GET /admin/audit-logs.
   */
  async list(query: AuditLogQueryDto): Promise<PaginatedResult<AuditLog>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.entityId ? { entityId: query.entityId } : {}),
      ...(query.actorUserId ? { actorUserId: query.actorUserId } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { actor: { select: { id: true, name: true, phoneNumber: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, limit };
  }
}
