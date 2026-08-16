import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { EventBusService } from '../../shared/events/event-bus.service';

/**
 * FulfillmentService
 * Takeaway vs store-delivery logic, Phase 2 rider hook — seq 9.5, 9.10
 * Sequence diagrams: 9.5 (store-managed delivery), 9.10 (Phase 2 rider, dormant)
 *
 * TODO: Implement business logic per LLD sequence diagrams.
 */
@Injectable()
export class FulfillmentService {
  private readonly logger = new Logger(FulfillmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  // TODO: Implement methods referenced by FulfillmentController
  // and consumed by other modules via EventBus listeners.
}
