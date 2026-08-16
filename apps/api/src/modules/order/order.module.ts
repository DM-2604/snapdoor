import { Module } from '@nestjs/common';
import { InventoryModule } from '../inventory/inventory.module';
import { OffersModule } from '../offers/offers.module';
import { CheckoutController } from './checkout.controller';
import { CustomerCartController } from './customer-cart.controller';
import { CustomerOrderController } from './customer-order.controller';
import { OrderController } from './order.controller';
import { OrderSseService } from './order-sse.service';
import { OrderService } from './order.service';
import { CartService } from './cart.service';

@Module({
  imports: [
    InventoryModule,
    OffersModule,
    // PlatformConfigModule removed — CommissionResolver not used in Phase 1 (commission = 0)
    // PaymentModule removed — payment creation happens directly in OrderService via PrismaService
  ],
  controllers: [OrderController, CheckoutController, CustomerOrderController, CustomerCartController],
  providers: [OrderService, OrderSseService, CartService],
  exports: [OrderService],
})
export class OrderModule {}
