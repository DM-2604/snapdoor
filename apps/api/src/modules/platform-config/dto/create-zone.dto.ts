// create-zone.dto.ts — Implements v3 §3 platform-config
import { IsString, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateZoneDto {
  @ApiProperty({ example: 'Ahmedabad West' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Short zone code used in store codes', example: 'AMD-W' })
  @IsString()
  code!: string;

  @ApiPropertyOptional({ description: 'Map display color (hex)', example: '#22c55e' })
  @IsString()
  @IsOptional()
  colorHex?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Zone-level commission override %', example: 5.5 })
  @IsNumber()
  @IsOptional()
  defaultCommissionPercent?: number;

  @ApiProperty({ description: 'Zone centroid latitude (WGS-84). Zone polygon drawing is out of scope for Phase 1.', example: 23.0225 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiProperty({ description: 'Zone centroid longitude (WGS-84)', example: 72.5714 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;
}
