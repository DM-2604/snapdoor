import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

/**
 * PaymentModule — bounded context
 * Razorpay integration, webhooks, split settlement — seq 9.4, 9.7
 * Sequence diagrams: 9.4 (payment intent), 9.7 (payout)
 */
@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
