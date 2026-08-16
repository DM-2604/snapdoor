import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrderStatus, UserRole } from '@prisma/client';
import { CurrentUser, JwtPayload } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { CustomerCancelOrderDto, ReorderDto } from './dto/cart.dto';
import { OrderService } from './order.service';

@ApiTags('customer — orders & tracking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@Controller('customer/orders')
export class CustomerOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'List customer order history with status and invoice summary' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  getCustomerOrders(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: OrderStatus,
  ) {
    return this.orderService.getCustomerOrders(user.sub, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full customer order details, timeline history, and delivery assignment' })
  getCustomerOrderById(
    @CurrentUser() user: JwtPayload,
    @Param('id') orderId: string,
  ) {
    return this.orderService.getCustomerOrderById(orderId, user.sub);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Cancel order within time-boxed window (Takeaway 120s, Delivery 30s) and trigger stock release + refund',
  })
  customerCancelOrder(
    @CurrentUser() user: JwtPayload,
    @Param('id') orderId: string,
    @Body() dto: CustomerCancelOrderDto,
  ) {
    return this.orderService.customerCancelOrder(orderId, user.sub, dto);
  }

  @Post(':id/reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Reorder items from a past order into active cart with live price/stock resolution and conflict check',
  })
  reorder(
    @CurrentUser() user: JwtPayload,
    @Param('id') orderId: string,
    @Body() dto: ReorderDto,
  ) {
    return this.orderService.reorder(orderId, user.sub, dto);
  }
}
