import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { EventBusService } from '../../shared/events/event-bus.service';

/**
 * NotificationService
 * FCM push + SMS, templated, domain-event-driven — all sequences
 * Sequence diagrams: 9.1-9.10 (receives events from all modules)
 *
 * TODO: Implement business logic per LLD sequence diagrams.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  // TODO: Implement methods referenced by NotificationController
  // and consumed by other modules via EventBus listeners.
}
