import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryAdjustmentReason } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AdjustInventoryDto {
  @ApiProperty({
    example: 'c2b647f5-25b4-4b5b-8fd1-e58f03a6bc01',
    description: 'ProductVariant UUID to adjust',
  })
  @IsNotEmpty()
  @IsUUID()
  productVariantId!: string;

  @ApiProperty({
    example: 10,
    description: 'Stock quantity difference (positive for adding stock, negative for reduction)',
  })
  @IsNotEmpty()
  @IsInt()
  changeQty!: number;

  @ApiProperty({
    enum: InventoryAdjustmentReason,
    example: InventoryAdjustmentReason.RESTOCK,
    description: 'Reason for the stock change (RESTOCK, MANUAL, CORRECTION, SALE, ORDER_CANCELLED_RELEASE)',
  })
  @IsNotEmpty()
  @IsEnum(InventoryAdjustmentReason)
  reason!: InventoryAdjustmentReason;

  @ApiPropertyOptional({
    example: 'Damaged stock during transit',
    description: 'Optional note or reference for this adjustment',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
