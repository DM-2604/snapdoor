// Implements v3 §0.1 — PrismaService with soft-delete + audit-columns extensions

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ActorContextService } from '../cls/actor-context.service';
import { makeAuditColumnsExtension } from './extensions/audit-columns.extension';
import { makeSoftDeleteExtension } from './extensions/soft-delete.extension';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly actorCtx: ActorContextService) {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });

    const getActorId = () => this.actorCtx.getActorId();

    // Apply extensions in order: audit-columns first so its timestamps are set
    // before soft-delete potentially rewrites a delete into an update.
    // Note: soft-delete's delete→update calls the BASE client directly,
    // so it sets all audit fields inline rather than relying on the audit extension.
    return (this as any)
      .$extends(makeAuditColumnsExtension(getActorId))
      .$extends(makeSoftDeleteExtension(getActorId)) as this;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
