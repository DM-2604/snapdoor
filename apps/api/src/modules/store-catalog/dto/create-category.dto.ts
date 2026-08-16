// create-category.dto.ts — Platform taxonomy category (vertical or sub-category)
import { IsString, IsOptional, IsUUID, IsBoolean, IsInt, IsUrl, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiPropertyOptional({
    description: 'Parent category UUID. Null = top-level store vertical. Non-null = product sub-category.',
    example: '00000000-0000-0000-0001-000000000001',
  })
  @IsUUID()
  @IsOptional()
  parentCategoryId?: string;

  @ApiProperty({ description: 'Category display name', example: 'Grocery' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Public CDN URL for category icon (SVG or PNG)', example: 'https://cdn.example.com/icons/grocery.svg' })
  @IsUrl()
  @IsOptional()
  iconUrl?: string;

  @ApiPropertyOptional({ description: 'Display sort order (lower = first)', default: 0, minimum: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Whether this category is active and visible to store owners', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
