import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FulfillmentType, PaymentMethod } from '@prisma/client';

export class AddCartItemDto {
  @ApiProperty({ description: 'Store UUID where the item is being purchased' })
  @IsUUID()
  @IsNotEmpty()
  storeId!: string;

  @ApiProperty({ description: 'Product variant UUID' })
  @IsUUID()
  @IsNotEmpty()
  productVariantId!: string;

  @ApiProperty({ description: 'Quantity to add (minimum 1)', example: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({
    description: 'If true, auto-clears any active cart at a different store without throwing a 409 conflict',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  confirmClearOtherCart?: boolean;
}

export class UpdateCartItemDto {
  @ApiProperty({ description: 'Updated quantity (minimum 1)', example: 2 })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CustomerContactDto {
  @ApiProperty({ example: 'Aarav Patel' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiPropertyOptional({ example: 'Flat 402, Shivalik Residency, Ahmedabad' })
  @IsString()
  @IsOptional()
  deliveryAddress?: string;

  /** Alias sent by the frontend checkout page */
  @ApiPropertyOptional({ example: 'Flat 402, Shivalik Residency, Ahmedabad' })
  @IsString()
  @IsOptional()
  addressLine?: string;
}

export class CheckoutCartDto {
  @ApiPropertyOptional({ description: 'Store UUID — used as a routing hint from the frontend', example: 'uuid' })
  @IsUUID()
  @IsOptional()
  storeId?: string;

  @ApiProperty({ enum: FulfillmentType, example: FulfillmentType.TAKEAWAY })
  @IsEnum(FulfillmentType)
  fulfillmentType!: FulfillmentType;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.UPI })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiProperty({ type: CustomerContactDto })
  @IsObject()
  @ValidateNested()
  @Type(() => CustomerContactDto)
  customerContact!: CustomerContactDto;

  @ApiPropertyOptional({ example: 'Please do not ring the bell' })
  @IsString()
  @IsOptional()
  storeNotes?: string;

  @ApiPropertyOptional({ example: 'FLAT10' })
  @IsString()
  @IsOptional()
  couponCode?: string;
}

export class ReorderDto {
  @ApiPropertyOptional({
    description: 'If true, auto-clears any active cart at a different store when creating cart for reorder',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  confirmClearOtherCart?: boolean;
}

export class CustomerCancelOrderDto {
  @ApiPropertyOptional({ example: 'Changed my mind', description: 'Cancellation reason' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class MergeCartItemDto {
  @ApiProperty({ description: 'Product variant UUID' })
  @IsUUID()
  @IsNotEmpty()
  productVariantId!: string;

  @ApiProperty({ description: 'Quantity (minimum 1)', example: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class MergeCartDto {
  @ApiProperty({ description: 'Store UUID for this cart' })
  @IsUUID()
  @IsNotEmpty()
  storeId!: string;

  @ApiProperty({ type: [MergeCartItemDto], description: 'Guest cart items to merge atomically' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MergeCartItemDto)
  items!: MergeCartItemDto[];
}
