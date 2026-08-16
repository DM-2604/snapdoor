import { Injectable } from '@nestjs/common';

export interface CreatePaymentIntentParams {
  orderId: string;
  amount: number;
  currency?: string;
}

export interface PaymentIntentResult {
  gatewayOrderId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface VerifyPaymentParams {
  gatewayPaymentId: string;
  signature?: string;
  payload?: any;
}

export interface InitiateRefundParams {
  paymentId: string;
  gatewayPaymentId?: string;
  amount: number;
  reason: string;
}

export interface RefundResult {
  gatewayRefundId: string;
  amount: number;
  status: string;
}

export interface PaymentProvider {
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<boolean>;
  initiateRefund(params: InitiateRefundParams): Promise<RefundResult>;
}

export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    const timestamp = Date.now();
    return {
      gatewayOrderId: `mock_order_${timestamp}_${Math.floor(Math.random() * 1000)}`,
      amount: params.amount,
      currency: params.currency || 'INR',
      status: 'created',
    };
  }

  async verifyPayment(_params: VerifyPaymentParams): Promise<boolean> {
    // In mock mode, all verification checks pass unless explicitly designed otherwise
    return true;
  }

  async initiateRefund(params: InitiateRefundParams): Promise<RefundResult> {
    const timestamp = Date.now();
    return {
      gatewayRefundId: `mock_rfnd_${timestamp}_${Math.floor(Math.random() * 1000)}`,
      amount: params.amount,
      status: 'processed',
    };
  }
}
