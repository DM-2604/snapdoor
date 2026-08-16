// create-city.dto.ts — Implements v3 §3 platform-config
import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CityStatus } from '@prisma/client';

export class CreateCityDto {
  @ApiProperty({ example: 'Ahmedabad' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Gujarat' })
  @IsString()
  state!: string;

  @ApiPropertyOptional({ default: 'India' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: 'Asia/Kolkata' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ enum: CityStatus, default: 'ACTIVE' })
  @IsEnum(CityStatus)
  @IsOptional()
  status?: CityStatus;

  @ApiPropertyOptional({ description: 'ISO 8601 date for city launch', example: '2026-01-01' })
  @IsDateString()
  @IsOptional()
  launchDate?: string;

  @ApiPropertyOptional({ description: 'Default commission % for all stores in this city', example: 6.0 })
  @IsNumber()
  @IsOptional()
  defaultCommissionPercent?: number;

  @ApiPropertyOptional({ description: 'Whether platform-managed delivery fleet is active in this city', default: false })
  @IsBoolean()
  @IsOptional()
  isDeliveryFleetEnabled?: boolean;
}
