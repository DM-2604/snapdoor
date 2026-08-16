import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser, JwtPayload } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import { OrderService } from './order.service';
import { BadRequestException } from '@nestjs/common';

@ApiTags('orders — customer checkout')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@Controller('orders')
export class CheckoutController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Customer online order placement & stock reservation (APP channel)' })
  @ApiHeader({
    name: 'idempotency-key',
    description: 'UUID v4 — provide the same key on retry to get the original response without duplicating the order',
    required: true,
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  checkout(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CheckoutOrderDto,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('Missing required header: idempotency-key');
    }
    return this.orderService.checkout(dto, user.sub, idempotencyKey);
  }
}
