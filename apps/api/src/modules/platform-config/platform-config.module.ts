// Implements v3 §0.3 — PlatformConfig module
//
// FIXME:COMMISSION_GUARD — This module owns Store.effectiveCommissionPercent.
// When store-catalog module is built, any store.update() touching that field must:
//   1. Route through CommissionResolverService.applyEffectiveRateToStore()
//   2. OR throw explicitly if called from outside this service
// Search for FIXME:COMMISSION_GUARD across the codebase to find all enforcement points.

import { Module } from '@nestjs/common';
import { CommissionResolverService } from './commission-resolver.service';
import { PlatformConfigService } from './platform-config.service';
import { PlatformConfigController } from './platform-config.controller';
import { PrismaCommissionSearchService } from './commission-search.service';

@Module({
  controllers: [PlatformConfigController],
  providers: [CommissionResolverService, PlatformConfigService, PrismaCommissionSearchService],
  exports: [CommissionResolverService, PlatformConfigService, PrismaCommissionSearchService],
})
export class PlatformConfigModule {}
