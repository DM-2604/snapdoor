import { Module } from '@nestjs/common';
import { FulfillmentController } from './fulfillment.controller';
import { FulfillmentService } from './fulfillment.service';

/**
 * FulfillmentModule — bounded context
 * Takeaway vs store-delivery logic, Phase 2 rider hook — seq 9.5, 9.10
 * Sequence diagrams: 9.5 (store-managed delivery), 9.10 (Phase 2 rider, dormant)
 */
@Module({
  controllers: [FulfillmentController],
  providers: [FulfillmentService],
  exports: [FulfillmentService],
})
export class FulfillmentModule {}
