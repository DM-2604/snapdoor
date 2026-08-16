import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { EventBusService } from '../../shared/events/event-bus.service';

/**
 * SearchService
 * Meilisearch indexing/query — stubbed in dev
 * Sequence diagrams: N/A (stubbed; enabled by SEARCH_ENABLED=true)
 *
 * TODO: Implement business logic per LLD sequence diagrams.
 */
@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  // TODO: Implement methods referenced by SearchController
  // and consumed by other modules via EventBus listeners.
}
