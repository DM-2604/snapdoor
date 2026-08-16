import { Module } from '@nestjs/common';
import { StoreCatalogService } from './store-catalog.service';
import { StoreCatalogController } from './store-catalog.controller';
import { StoreOwnerCatalogService } from './store-owner-catalog.service';
import { StoreOwnerCatalogController } from './store-owner-catalog.controller';
import { CustomerStoreCatalogService } from './customer-store-catalog.service';
import { CustomerStoreCatalogController } from './customer-store-catalog.controller';
import { PlatformConfigModule } from '../platform-config/platform-config.module';
import { AdminOpsModule } from '../admin-ops/admin-ops.module';
import { DocumentsModule } from '../documents/documents.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    PlatformConfigModule, // for CommissionResolverService
    AdminOpsModule,       // for AuditLogService + STORE_NOTIFICATION_SERVICE
    DocumentsModule,      // for DocumentsService (KYC status and verification)
    InventoryModule,      // for InventoryService (variant stock management)
  ],
  controllers: [
    StoreCatalogController,
    StoreOwnerCatalogController,
    CustomerStoreCatalogController,
  ],
  providers: [
    StoreCatalogService,
    StoreOwnerCatalogService,
    CustomerStoreCatalogService,
  ],
  exports: [
    StoreCatalogService,
    StoreOwnerCatalogService,
    CustomerStoreCatalogService,
  ],
})
export class StoreCatalogModule {}
