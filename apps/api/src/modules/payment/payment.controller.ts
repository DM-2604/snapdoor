import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../shared/decorators/current-user.decorator';

/**
 * PaymentController
 * Sequence diagrams: 9.4 (payment intent), 9.7 (payout)
 *
 * TODO: Implement routes per LLD sequence diagrams.
 */
@ApiTags('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // TODO: Add route handlers referencing sequence diagrams 9.4 (payment intent), 9.7 (payout)
  // Stub health route for build verification
  @Get('health')
  @ApiOperation({ summary: 'Payment module health check' })
  health() {
    return { module: 'payment', status: 'ok' };
  }
}
