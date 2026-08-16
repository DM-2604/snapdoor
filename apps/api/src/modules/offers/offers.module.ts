// apps/api/src/modules/offers/offers.module.ts
import { Module } from '@nestjs/common';
import { CustomerOffersController } from './customer-offers.controller';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';

@Module({
  controllers: [OffersController, CustomerOffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
