import { ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus, PayoutStatus } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateStoreBillingDto {
  @ApiPropertyOptional({ example: '29ABCDE1234F1Z5', description: 'GSTIN tax registration number' })
  @IsOptional()
  @IsString()
  gstNumber?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether store is registered under GST' })
  @IsOptional()
  @IsBoolean()
  gstRegistered?: boolean;

  @ApiPropertyOptional({ example: 'ABCDE1234F', description: 'Permanent Account Number (PAN)' })
  @IsOptional()
  @IsString()
  panNumber?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether B2B GST tax invoice is required for platform fees' })
  @IsOptional()
  @IsBoolean()
  gstInvoiceRequired?: boolean;

  @ApiPropertyOptional({ example: 'billing@store.com', description: 'Finance/accounts contact email' })
  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @ApiPropertyOptional({ example: '+919876543210', description: 'Billing contact phone' })
  @IsOptional()
  @IsPhoneNumber('IN')
  billingContactPhone?: string;

  @ApiPropertyOptional({ example: 'c1b647f5-25b4-4b5b-8fd1-e58f03a6bc09', description: 'Primary PayoutAccount UUID' })
  @IsOptional()
  @IsUUID()
  payoutAccountId?: string;
}

export class ListInvoicesQueryDto {
  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  limit?: number;
}

export class ListSettlementsQueryDto {
  @ApiPropertyOptional({ enum: PayoutStatus })
  @IsOptional()
  @IsEnum(PayoutStatus)
  status?: PayoutStatus;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  limit?: number;
}
