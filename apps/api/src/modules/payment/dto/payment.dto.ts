import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsObject, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaymentStatus } from '@prisma/client';

export class MockConfirmPaymentDto {
  @ApiProperty({
    enum: PaymentStatus,
    default: PaymentStatus.SUCCESS,
    description: 'Target payment status to simulate',
  })
  @IsEnum(PaymentStatus)
  status!: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Custom mock gateway payment ID',
    example: 'mock_pay_1723123456789',
  })
  @IsString()
  @IsOptional()
  gatewayPaymentId?: string;

  @ApiPropertyOptional({
    description: 'Mock gateway response payload',
    example: { method: 'upi', vpa: 'customer@okaxis' },
  })
  @IsObject()
  @IsOptional()
  gatewayResponse?: Record<string, any>;
}

export class InitiateRefundDto {
  @ApiPropertyOptional({
    description: 'Amount to refund. If omitted, full payment amount is refunded.',
    example: 450.0,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  amount?: number;

  @ApiProperty({
    description: 'Reason for issuing the refund',
    example: 'Item defective or customer cancelled within grace period',
  })
  @IsString()
  reason!: string;
}
