// Implements v3 §0.0 — Root application module

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Config
import configuration from './config/configuration';
import { validateEnv } from './config/validation.schema';

// Shared infrastructure
import { ClsModule } from './shared/cls/cls.module';
import { ActorContextService } from './shared/cls/actor-context.service';
import { DatabaseModule } from './shared/database/database.module';
import { EventBusModule } from './shared/events/event-bus.module';
import { QueueModule } from './shared/queue/queue.module';
import { HealthModule } from './shared/health/health.module';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';

// Domain modules
import { IdentityModule } from './modules/identity/identity.module';
import { PlatformConfigModule } from './modules/platform-config/platform-config.module';
import { StoreCatalogModule } from './modules/store-catalog/store-catalog.module';
import { MerchandisingModule } from './modules/merchandising/merchandising.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrderModule } from './modules/order/order.module';
import { FulfillmentModule } from './modules/fulfillment/fulfillment.module';
import { BillingModule } from './modules/billing/billing.module';
import { PaymentModule } from './modules/payment/payment.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { DeliveryFleetModule } from './modules/delivery-fleet/delivery-fleet.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SearchModule } from './modules/search/search.module';
import { AdminOpsModule } from './modules/admin-ops/admin-ops.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { JobsModule } from './modules/jobs/jobs.module';

@Module({
  imports: [
    // Config — must come first
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
      cache: true,
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },   // 10 req/sec
      { name: 'medium', ttl: 60_000, limit: 100 }, // 100 req/min
    ]),

    // Cron scheduler (used by billing processor)
    ScheduleModule.forRoot(),

    // Structured logging
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get('app.env') === 'production' ? 'info' : 'debug',
          transport:
            config.get('app.env') !== 'production'
              ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
              : undefined,
          serializers: {
            req: (req) => ({ method: req.method, url: req.url }),
            res: (res) => ({ statusCode: res.statusCode }),
          },
          redact: ['req.headers.authorization'],
        },
      }),
    }),

    // Shared infrastructure (global)
    ClsModule,
    DatabaseModule,
    EventBusModule,
    QueueModule,
    HealthModule,

    // Domain modules
    IdentityModule,
    PlatformConfigModule,
    StoreCatalogModule,
    MerchandisingModule,
    InventoryModule,
    OrderModule,
    FulfillmentModule,
    BillingModule,
    PaymentModule,
    RatingsModule,
    DeliveryFleetModule, // Dormant Phase 1 — no controllers exposed
    NotificationModule,
    SearchModule,
    AdminOpsModule,
    DocumentsModule,
    JobsModule,    // Job providers registered (cron disabled until Phase 2)
  ],
  providers: [
    ActorContextService,
    // Global guards (applied to every route)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    // Global filter + interceptor
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
