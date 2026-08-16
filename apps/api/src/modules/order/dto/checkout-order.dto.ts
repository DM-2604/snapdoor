import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FulfillmentType, PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CheckoutItemDto {
  @ApiProperty({ example: 'd3b07384-d113-40e1-953b-000000000001' })
  @IsString()
  @IsNotEmpty()
  productVariantId!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CheckoutOrderDto {
  @ApiProperty({ example: 'a1b07384-d113-40e1-953b-000000000001' })
  @IsString()
  @IsNotEmpty()
  storeId!: string;

  @ApiProperty({ enum: FulfillmentType, example: FulfillmentType.TAKEAWAY })
  @IsEnum(FulfillmentType)
  fulfillmentType!: FulfillmentType;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.UPI })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiProperty({ type: [CheckoutItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];

  @ApiProperty({ example: 'Aarav Sharma' })
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  customerPhone!: string;

  @ApiPropertyOptional({ example: '#104, Green Glen Layout, Bellandur, Bengaluru' })
  @IsString()
  @IsOptional()
  deliveryAddress?: string;

  @ApiPropertyOptional({ example: 'Please do not ring the doorbell' })
  @IsString()
  @IsOptional()
  storeNotes?: string;
}
