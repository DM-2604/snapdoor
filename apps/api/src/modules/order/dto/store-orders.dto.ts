import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FulfillmentType, OrderChannel, OrderStatus } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class RejectOrderDto {
  @ApiProperty({
    example: 'Out of stock on key ingredients',
    description: 'Reason for rejecting the incoming order',
  })
  @IsNotEmpty()
  @IsString()
  reason!: string;
}

export class DispatchOrderDto {
  @ApiPropertyOptional({
    example: 'd9b647f5-25b4-4b5b-8fd1-e58f03a6bc02',
    description: 'Delivery staff UUID handling this store-fulfilled delivery',
  })
  @IsOptional()
  @IsUUID()
  deliveredByStaffId?: string;
}

export class ListStoreOrdersQueryDto {
  @ApiPropertyOptional({ enum: OrderStatus, description: 'Filter by order status' })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ enum: OrderChannel, description: 'Filter by channel (APP or POS)' })
  @IsOptional()
  @IsEnum(OrderChannel)
  channel?: OrderChannel;

  @ApiPropertyOptional({ enum: FulfillmentType, description: 'Filter by fulfillment type' })
  @IsOptional()
  @IsEnum(FulfillmentType)
  fulfillmentType?: FulfillmentType;

  @ApiPropertyOptional({ example: '2026-08-01', description: 'From date (ISO string)' })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-08-31', description: 'To date (ISO string)' })
  @IsOptional()
  @IsString()
  toDate?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  @IsOptional()
  limit?: number;
}

export class CreateDeliveryStaffDto {
  @ApiProperty({ example: 'Ravi Kumar', description: 'Name of store delivery personnel' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: '+919876543210', description: 'Mobile phone number' })
  @IsNotEmpty()
  @IsPhoneNumber('IN')
  phone!: string;
}

export class UpdateDeliveryStaffDto {
  @ApiPropertyOptional({ example: 'Ravi Kumar' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsPhoneNumber('IN')
  phone?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
