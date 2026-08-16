// set-setting.dto.ts
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetSettingDto {
  @ApiProperty({
    description: 'JSON-serializable value stored in the `value` Json column. Can be a string, number, boolean, or object.',
    example: '{"maxOrdersPerHour": 100}',
  })
  value: unknown;

  @ApiPropertyOptional({ description: 'Human-readable description of what this setting controls' })
  @IsString()
  @IsOptional()
  description?: string;
}
