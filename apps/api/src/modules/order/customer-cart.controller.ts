import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser, JwtPayload } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { CartService } from './cart.service';
import { AddCartItemDto, CheckoutCartDto, MergeCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { OrderService } from './order.service';

@ApiTags('customer — cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@Controller('cart')
export class CustomerCartController {
  constructor(
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current active cart for logged-in customer' })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  getCart(
    @CurrentUser() user: JwtPayload,
    @Query('storeId') storeId?: string,
  ) {
    return this.cartService.getCart(user.sub, storeId);
  }

  @Post('items')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add item to cart (guards against cross-store item mixing with 409)' })
  addItem(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartService.addItem(user.sub, dto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateItem(
    @CurrentUser() user: JwtPayload,
    @Param('id') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.sub, itemId, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove an item from active cart' })
  removeItem(
    @CurrentUser() user: JwtPayload,
    @Param('id') itemId: string,
  ) {
    return this.cartService.removeItem(user.sub, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear/abandon active cart' })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  clearCart(
    @CurrentUser() user: JwtPayload,
    @Query('storeId') storeId?: string,
  ) {
    return this.cartService.clearCart(user.sub, storeId);
  }

  @Post('merge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atomically merge guest cart items into authenticated cart on login' })
  mergeCart(
    @CurrentUser() user: JwtPayload,
    @Body() dto: MergeCartDto,
  ) {
    return this.cartService.mergeCart(user.sub, dto);
  }

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Checkout active cart into an APP order and reserve stock' })
  @ApiHeader({
    name: 'idempotency-key',
    description: 'UUID v4 — prevents duplicate orders on retry',
    required: true,
  })
  async checkout(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CheckoutCartDto,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('Missing required header: idempotency-key');
    }

    // 1. Read the active cart from DB to get items + storeId
    const cartResult = await this.cartService.getCart(user.sub, dto.storeId);
    if (!cartResult || !cartResult.cart?.items?.length) {
      throw new BadRequestException('Your cart is empty or could not be found');
    }

    // 2. Build the CheckoutOrderDto shape the order service expects
    const orderDto = {
      storeId: cartResult.cart.storeId ?? dto.storeId!,
      fulfillmentType: dto.fulfillmentType,
      paymentMethod: dto.paymentMethod,
      customerName: dto.customerContact.name,
      customerPhone: dto.customerContact.phone,
      deliveryAddress: dto.customerContact.deliveryAddress ?? dto.customerContact.addressLine ?? null,
      storeNotes: dto.storeNotes ?? null,
      items: cartResult.cart.items.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
      })),
    };

    return this.orderService.checkout(orderDto as any, user.sub, idempotencyKey);
  }
}
