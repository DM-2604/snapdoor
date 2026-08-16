import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class PosOrderItemDto {
  @ApiProperty({
    example: 'c2b647f5-25b4-4b5b-8fd1-e58f03a6bc01',
    description: 'ProductVariant UUID to purchase',
  })
  @IsNotEmpty()
  @IsUUID()
  productVariantId!: string;

  @ApiProperty({ example: 2, description: 'Quantity purchased' })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quantity!: number;

  @ApiPropertyOptional({
    example: 99.5,
    description: 'Optional custom unit price override; defaults to variant or product base price',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  unitPrice?: number;
}

export class CreatePosOrderDto {
  @ApiProperty({
    type: [PosOrderItemDto],
    description: 'List of line items purchased in this POS transaction',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PosOrderItemDto)
  items!: PosOrderItemDto[];

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.UPI,
    description: 'Payment method collected at counter (UPI, CARD, COD/CASH, PAY_AT_PICKUP)',
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({
    example: '+919876543210',
    description: 'Optional walk-in customer mobile number for SMS/receipt',
  })
  @IsOptional()
  @IsString()
  customerPhoneNumber?: string;

  @ApiPropertyOptional({
    example: 'Ramesh Kumar',
    description: 'Optional customer name',
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({
    example: 'Counter 1 walk-in',
    description: 'Internal merchant note for this sale',
  })
  @IsOptional()
  @IsString()
  storeNotes?: string;
}
