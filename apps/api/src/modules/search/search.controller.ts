import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../shared/decorators/current-user.decorator';

/**
 * SearchController
 * Sequence diagrams: N/A (stubbed; enabled by SEARCH_ENABLED=true)
 *
 * TODO: Implement routes per LLD sequence diagrams.
 */
@ApiTags('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // TODO: Add route handlers referencing sequence diagrams N/A (stubbed; enabled by SEARCH_ENABLED=true)
  // Stub health route for build verification
  @Get('health')
  @ApiOperation({ summary: 'Search module health check' })
  health() {
    return { module: 'search', status: 'ok' };
  }
}
