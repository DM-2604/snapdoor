// create-fee-plan.dto.ts
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlatformFeePlanType, BillingFrequency } from '@prisma/client';

export class CreateFeePlanDto {
  @ApiPropertyOptional({ description: 'Restrict this fee plan to a specific city. Null = platform-wide.' })
  @IsUUID()
  @IsOptional()
  cityId?: string;

  @ApiProperty({ description: 'Human-readable plan name', example: 'Phase 1 Flat Fee — ₹499/mo' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: PlatformFeePlanType, example: 'FLAT_MONTHLY' })
  @IsEnum(PlatformFeePlanType)
  planType!: PlatformFeePlanType;

  @ApiPropertyOptional({ description: 'Monthly subscription fee in INR (for FLAT_MONTHLY plans)', example: 499 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyFee?: number;

  @ApiPropertyOptional({ description: 'One-time setup fee in INR', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  setupFee?: number;

  @ApiPropertyOptional({ enum: BillingFrequency, default: 'MONTHLY' })
  @IsEnum(BillingFrequency)
  @IsOptional()
  billingFrequency?: BillingFrequency;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'ISO 8601 date from which this fee plan is effective', example: '2026-01-01' })
  @IsDateString()
  effectiveFrom!: string;

  @ApiPropertyOptional({ description: 'ISO 8601 date until which this fee plan is effective' })
  @IsDateString()
  @IsOptional()
  effectiveTo?: string;
}
