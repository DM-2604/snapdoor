import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MerchandisingService } from './merchandising.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../shared/decorators/current-user.decorator';

/**
 * MerchandisingController
 * Sequence diagrams: N/A (admin-managed content)
 *
 * TODO: Implement routes per LLD sequence diagrams.
 */
@ApiTags('merchandising')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('merchandising')
export class MerchandisingController {
  constructor(private readonly merchandisingService: MerchandisingService) {}

  // TODO: Add route handlers referencing sequence diagrams N/A (admin-managed content)
  // Stub health route for build verification
  @Get('health')
  @ApiOperation({ summary: 'Merchandising module health check' })
  health() {
    return { module: 'merchandising', status: 'ok' };
  }
}
