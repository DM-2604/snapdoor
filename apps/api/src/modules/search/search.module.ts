import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

/**
 * SearchModule — bounded context
 * Meilisearch indexing/query — stubbed in dev
 * Sequence diagrams: N/A (stubbed; enabled by SEARCH_ENABLED=true)
 */
@Module({
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
