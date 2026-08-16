// apps/api/src/modules/offers/dto/create-offer.dto.ts
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfferType, RewardType } from '@prisma/client';

export class CreateOfferDto {
  @ApiProperty({ example: 'Get 10% off on Dairy' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: OfferType })
  @IsEnum(OfferType)
  offerType!: OfferType;

  @ApiProperty({ example: '2026-08-01T00:00:00Z' })
  @IsDateString()
  startsAt!: string;

  @ApiPropertyOptional({ example: '2026-08-31T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  endsAt?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // ── Triggers ──────────────────────────────────────────────────────────────

  @ApiPropertyOptional({ description: 'Min cart value to trigger offer (₹)' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  triggerMinCartValue?: number;

  @ApiPropertyOptional({ description: 'Min quantity for BUY_X_GET_Y_FREE' })
  @IsInt()
  @IsOptional()
  triggerQuantity?: number;

  @ApiPropertyOptional({ default: false, description: 'Applies to all products in store' })
  @IsBoolean()
  @IsOptional()
  triggerIsEntireStore?: boolean;

  @ApiPropertyOptional({ type: [String], description: 'Product IDs that trigger this offer' })
  @IsUUID('all', { each: true })
  @IsOptional()
  triggerProductIds?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Category IDs that trigger this offer' })
  @IsUUID('all', { each: true })
  @IsOptional()
  triggerCategoryIds?: string[];

  // ── Reward ────────────────────────────────────────────────────────────────

  @ApiProperty({ enum: RewardType })
  @IsEnum(RewardType)
  rewardType!: RewardType;

  @ApiPropertyOptional({ description: 'Percent or flat amount' })
  @IsNumber()
  @IsOptional()
  rewardValue?: number;

  @ApiPropertyOptional({ description: 'Variant ID for FREE_ITEM reward' })
  @IsUUID()
  @IsOptional()
  rewardProductVariantId?: string;

  @ApiPropertyOptional({ description: 'Quantity for FREE_ITEM reward' })
  @IsInt()
  @IsOptional()
  rewardQuantity?: number;

  @ApiPropertyOptional({ description: 'Cap on discount for PERCENT_OFF (₹)' })
  @IsNumber()
  @IsOptional()
  maxDiscountAmount?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  maxUsesPerOrder?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  maxUsesTotal?: number;

  // ── Channels & Coupon ─────────────────────────────────────────────────────

  @ApiPropertyOptional({ description: 'Require a specific coupon code' })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  appliesToPos?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  appliesToApp?: boolean;
}
