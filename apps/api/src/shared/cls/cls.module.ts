// Implements v3 §0.1 — CLS module (actor context threading)
//
// Why nestjs-cls over REQUEST-scoped providers:
//   REQUEST-scoped providers force PrismaService to become REQUEST-scoped too,
//   cascading through the entire DI tree and breaking singleton services.
//   nestjs-cls uses AsyncLocalStorage to thread context without any scope change —
//   PrismaService stays a singleton; cron jobs simply have no CLS context (actorId = null).

import { Global, Module } from '@nestjs/common';
import { ClsModule as NestClsModule } from 'nestjs-cls';
import { ActorContextService } from './actor-context.service';

@Global()
@Module({
  imports: [
    NestClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: false,
      },
    }),
  ],
  providers: [ActorContextService],
  exports: [ActorContextService],
})
export class ClsModule {}
