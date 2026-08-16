import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FulfillmentService } from './fulfillment.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../shared/decorators/current-user.decorator';

/**
 * FulfillmentController
 * Sequence diagrams: 9.5 (store-managed delivery), 9.10 (Phase 2 rider, dormant)
 *
 * TODO: Implement routes per LLD sequence diagrams.
 */
@ApiTags('fulfillment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('fulfillment')
export class FulfillmentController {
  constructor(private readonly fulfillmentService: FulfillmentService) {}

  // TODO: Add route handlers referencing sequence diagrams 9.5 (store-managed delivery), 9.10 (Phase 2 rider, dormant)
  // Stub health route for build verification
  @Get('health')
  @ApiOperation({ summary: 'Fulfillment module health check' })
  health() {
    return { module: 'fulfillment', status: 'ok' };
  }
}
