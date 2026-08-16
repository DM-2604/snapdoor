// create-commission-rule.dto.ts — Implements v3 §3 platform-config
// Commission rules are append-only — no update endpoint.
import { IsNumber, IsOptional, IsString, IsDateString, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommissionRuleDto {
  @ApiPropertyOptional({ description: 'City scope — null for global (Tier 5) rule', example: '00000000-0000-0000-0000-000000000001' })
  @IsUUID()
  @IsOptional()
  cityId?: string;

  @ApiPropertyOptional({ description: 'Zone scope — more specific than city' })
  @IsUUID()
  @IsOptional()
  zoneId?: string;

  @ApiPropertyOptional({ description: 'Category scope — targets a specific product category' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Store scope — most specific, overrides all others' })
  @IsUUID()
  @IsOptional()
  storeId?: string;

  @ApiProperty({ description: 'Commission percentage (0–100)', minimum: 0, maximum: 100, example: 10 })
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionPercent!: number;

  @ApiProperty({ description: 'ISO 8601 date from which this rule is effective', example: '2026-01-01' })
  @IsDateString()
  effectiveFrom!: string;

  @ApiPropertyOptional({ description: 'ISO 8601 date until which this rule is effective (null = no expiry)', example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  effectiveTo?: string;

  @ApiPropertyOptional({ description: 'Human-readable reason for the commission rule', example: 'Q3 2026 promotion — Grocery category' })
  @IsString()
  @IsOptional()
  reason?: string;
}
