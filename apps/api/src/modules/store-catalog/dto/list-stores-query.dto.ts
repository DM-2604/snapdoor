// list-stores-query.dto.ts
import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { StoreStatus } from '@prisma/client';

export class ListStoresQueryDto {
  @ApiPropertyOptional({ enum: StoreStatus, description: 'Filter by store status' })
  @IsEnum(StoreStatus)
  @IsOptional()
  status?: StoreStatus;

  @ApiPropertyOptional({ description: 'Full-text search on name or storeCode' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by city UUID' })
  @IsString()
  @IsOptional()
  cityId?: string;

  @ApiPropertyOptional({ description: 'Filter by zone UUID' })
  @IsString()
  @IsOptional()
  zoneId?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
