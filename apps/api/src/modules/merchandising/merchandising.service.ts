import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { EventBusService } from '../../shared/events/event-bus.service';

/**
 * MerchandisingService
 * Sales, carousels, themes, campaigns — v3 new §11
 * Sequence diagrams: N/A (admin-managed content)
 *
 * TODO: Implement business logic per LLD sequence diagrams.
 */
@Injectable()
export class MerchandisingService {
  private readonly logger = new Logger(MerchandisingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  // TODO: Implement methods referenced by MerchandisingController
  // and consumed by other modules via EventBus listeners.
}
