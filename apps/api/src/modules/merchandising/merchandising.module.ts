import { Module } from '@nestjs/common';
import { MerchandisingController } from './merchandising.controller';
import { MerchandisingService } from './merchandising.service';

/**
 * MerchandisingModule — bounded context
 * Sales, carousels, themes, campaigns — v3 new §11
 * Sequence diagrams: N/A (admin-managed content)
 */
@Module({
  controllers: [MerchandisingController],
  providers: [MerchandisingService],
  exports: [MerchandisingService],
})
export class MerchandisingModule {}
