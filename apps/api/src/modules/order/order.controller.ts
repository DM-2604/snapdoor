import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Store, UserRole } from '@prisma/client';
import { CurrentStore } from '../../shared/decorators/current-store.decorator';
import { CurrentUser, JwtPayload } from '../../shared/decorators/current-user.decorator';
import { RequireLiveStore } from '../../shared/decorators/require-live-store.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { StoreOwnerGuard } from '../../shared/guards/store-owner.guard';
import { CreatePosOrderDto } from './dto/create-pos-order.dto';
import {
  CreateDeliveryStaffDto,
  DispatchOrderDto,
  ListStoreOrdersQueryDto,
  RejectOrderDto,
  UpdateDeliveryStaffDto,
} from './dto/store-orders.dto';
import { OrderService } from './order.service';
import { OrderSseService } from './order-sse.service';

@ApiTags('store — orders & pos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, StoreOwnerGuard)
@Roles(UserRole.STORE_OWNER)
@RequireLiveStore()
@Controller('store')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderSseService: OrderSseService,
  ) {}

  // ── Store Orders Management ───────────────────────────────────────────────

  @Get('orders')
  @ApiOperation({ summary: 'List orders for store with status/channel/date filters' })
  listOrders(
    @CurrentStore() store: Store,
    @Query() query: ListStoreOrdersQueryDto,
  ) {
    return this.orderService.listOrdersForStore(store.id, query);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get full order details with items, contact, delivery staff, and timeline' })
  getOrder(
    @CurrentStore() store: Store,
    @Param('id') orderId: string,
  ) {
    return this.orderService.getOrderForStore(store.id, orderId);
  }

  @Post('orders/:id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept incoming order (transitions PLACED to ACCEPTED)' })
  acceptOrder(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Param('id') orderId: string,
  ) {
    return this.orderService.acceptOrder(store.id, orderId, user.sub);
  }

  @Post('orders/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject order with reason (transitions PLACED/ACCEPTED to REJECTED)' })
  rejectOrder(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Param('id') orderId: string,
    @Body() dto: RejectOrderDto,
  ) {
    return this.orderService.rejectOrder(store.id, orderId, dto, user.sub);
  }

  @Post('orders/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel active order before completion' })
  cancelOrder(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Param('id') orderId: string,
    @Body() dto: RejectOrderDto,
  ) {
    return this.orderService.cancelOrder(store.id, orderId, dto, user.sub);
  }

  @Post('orders/:id/prepare')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark order as preparing in kitchen/fulfillment (ACCEPTED to PREPARING)' })
  prepareOrder(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Param('id') orderId: string,
  ) {
    return this.orderService.prepareOrder(store.id, orderId, user.sub);
  }

  @Post('orders/:id/ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark order ready for takeaway or delivery (PREPARING to READY_FOR_PICKUP)' })
  markReady(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Param('id') orderId: string,
  ) {
    return this.orderService.markReady(store.id, orderId, user.sub);
  }

  @Post('orders/:id/dispatch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dispatch store delivery with assigned staff (to OUT_FOR_DELIVERY)' })
  dispatchOrder(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Param('id') orderId: string,
    @Body() dto: DispatchOrderDto,
  ) {
    return this.orderService.dispatchOrder(store.id, orderId, dto, user.sub);
  }

  @Post('orders/:id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete order and generate tax SalesInvoice (to COMPLETED)' })
  completeOrder(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Param('id') orderId: string,
  ) {
    return this.orderService.completeOrder(store.id, orderId, user.sub);
  }

  // ── POS Walk-in Billing (Section VI) ──────────────────────────────────────

  @Post('orders/pos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create offline POS walk-in transaction (immediate stock decrement & SalesInvoice generation)' })
  createPosOrder(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePosOrderDto,
  ) {
    return this.orderService.createPosOrder(store.id, dto, user.sub);
  }

  // ── SSE — Real-time new order push ────────────────────────────────────────

  @Get('orders/stream')
  @ApiOperation({ summary: 'SSE stream — subscribe to new order events for this store (store-admin dashboard)' })
  streamOrders(
    @CurrentStore() store: Store,
    @Res() res: Response,
  ) {
    this.orderSseService.subscribe(store.id, res);
  }

  // ── Sales Invoices (Section I & VI) ───────────────────────────────────────

  @Get('invoices/sales')
  @ApiOperation({ summary: 'List customer sales tax invoices generated for completed orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listSalesInvoices(
    @CurrentStore() store: Store,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.orderService.listSalesInvoices(
      store.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('invoices/sales/:id')
  @ApiOperation({ summary: 'Get details of a specific sales tax invoice' })
  getSalesInvoice(
    @CurrentStore() store: Store,
    @Param('id') invoiceId: string,
  ) {
    return this.orderService.getSalesInvoice(store.id, invoiceId);
  }

  // ── Delivery Staff Management ─────────────────────────────────────────────

  @Get('delivery-staff')
  @ApiOperation({ summary: 'List internal delivery personnel for the store' })
  listDeliveryStaff(@CurrentStore() store: Store) {
    return this.orderService.listDeliveryStaff(store.id);
  }

  @Post('delivery-staff')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new store delivery partner' })
  createDeliveryStaff(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateDeliveryStaffDto,
  ) {
    return this.orderService.createDeliveryStaff(store.id, dto, user.sub);
  }

  @Patch('delivery-staff/:id')
  @ApiOperation({ summary: 'Update store delivery partner details or active status' })
  updateDeliveryStaff(
    @CurrentStore() store: Store,
    @CurrentUser() user: JwtPayload,
    @Param('id') staffId: string,
    @Body() dto: UpdateDeliveryStaffDto,
  ) {
    return this.orderService.updateDeliveryStaff(store.id, staffId, dto, user.sub);
  }
}
