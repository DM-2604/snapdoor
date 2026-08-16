import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

// ── Profile Updates ──────────────────────────────────────────────────────────

export class UpdateStoreProfileDto {
  @ApiPropertyOptional({
    example: 'Neighborhood organic grocery delivering fresh daily staples.',
    description: 'Store public description / about text',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: 'Shop #12, 5th Cross, Indiranagar, Bengaluru - 560038',
    description: 'Physical address line',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://storage.localmart.in/stores/store-1.jpg'],
    description: 'Array of store photo URLs',
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  photos?: string[];

  @ApiPropertyOptional({ example: true, description: 'Accept customer takeaway/pickup orders' })
  @IsOptional()
  @IsBoolean()
  takeawayEnabled?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Offer direct store delivery' })
  @IsOptional()
  @IsBoolean()
  deliveryEnabled?: boolean;

  @ApiPropertyOptional({ example: 5.0, description: 'Delivery radius in kilometers' })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(50.0)
  deliveryRadiusKm?: number;

  @ApiPropertyOptional({ example: 30.0, description: 'Flat delivery fee charged to customer' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @ApiPropertyOptional({ example: 20, description: 'Average order preparation time in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(240)
  avgPrepTimeMinutes?: number;
}

// ── Operating Hours ──────────────────────────────────────────────────────────

export class OperatingHourItemDto {
  @ApiProperty({ example: 1, description: 'Day of week: 0 (Sunday) to 6 (Saturday)' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiPropertyOptional({ example: '08:00', description: 'Opening time in HH:MM format' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'openTime must be in HH:MM format' })
  openTime?: string;

  @ApiPropertyOptional({ example: '22:00', description: 'Closing time in HH:MM format' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'closeTime must be in HH:MM format' })
  closeTime?: string;

  @ApiProperty({ example: false, description: 'Whether the store is completely closed this day' })
  @IsBoolean()
  isClosed!: boolean;
}

export class UpsertOperatingHoursDto {
  @ApiProperty({ type: [OperatingHourItemDto], description: '7-day operating schedule' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @ValidateNested({ each: true })
  @Type(() => OperatingHourItemDto)
  hours!: OperatingHourItemDto[];
}

export class CreateHourExceptionDto {
  @ApiProperty({ example: '2026-08-15', description: 'Exception date (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  exceptionDate!: string;

  @ApiPropertyOptional({ example: '10:00', description: 'Special opening time' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'openTime must be in HH:MM format' })
  openTime?: string;

  @ApiPropertyOptional({ example: '16:00', description: 'Special closing time' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'closeTime must be in HH:MM format' })
  closeTime?: string;

  @ApiProperty({ example: true, description: 'Whether store is fully closed on this date' })
  @IsBoolean()
  isClosed!: boolean;

  @ApiPropertyOptional({ example: 'Independence Day Holiday', description: 'Reason for schedule exception' })
  @IsOptional()
  @IsString()
  reason?: string;
}

// ── Store Pause & Review ─────────────────────────────────────────────────────

export class TogglePauseDto {
  @ApiProperty({ example: true, description: 'True to pause receiving orders, false to resume' })
  @IsBoolean()
  isTemporarilyPaused!: boolean;

  @ApiPropertyOptional({ example: '2026-08-10T18:00:00.000Z', description: 'Auto-resume timestamp' })
  @IsOptional()
  @IsDateString()
  pausedUntil?: string;

  @ApiPropertyOptional({ example: 'Heavy rush in store', description: 'Reason for pause' })
  @IsOptional()
  @IsString()
  pauseReason?: string;
}

export class SubmitForReviewDto {
  @ApiPropertyOptional({
    example: 12.9716,
    description: 'Accurate store latitude pin',
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    example: 77.5946,
    description: 'Accurate store longitude pin',
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

// ── Product & Catalog DTOs ───────────────────────────────────────────────────

export class CreateProductDto {
  @ApiProperty({ example: 'Aashirvaad Superior MP Sharbati Atta 5kg', description: 'Product title' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ example: '100% pure MP Sharbati wheat flour', description: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '5kg', description: 'Default variant name, e.g., 500g, 1kg, Standard' })
  @IsOptional()
  @IsString()
  variantName?: string;

  @ApiPropertyOptional({ example: 'ATT-AASH-5KG', description: 'Store SKU code' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: 320.0, description: 'Maximum Retail Price (MRP)' })
  @IsNumber()
  @Min(0)
  mrp!: number;

  @ApiProperty({ example: 295.0, description: 'Merchant selling price' })
  @IsNumber()
  @Min(0)
  sellingPrice!: number;

  @ApiPropertyOptional({ example: 50, description: 'Initial inventory quantity in stock' })
  @IsOptional()
  @IsInt()
  @Min(0)
  initialStockQuantity?: number;

  @ApiPropertyOptional({ example: 5, description: 'Stock threshold for low-inventory alerts' })
  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ example: true, description: 'Automatically disable product when stock reaches 0' })
  @IsOptional()
  @IsBoolean()
  autoDisableAtZero?: boolean;

  @ApiPropertyOptional({ example: '11010000', description: 'GST Harmonized System Nomenclature (HSN) code' })
  @IsOptional()
  @IsString()
  hsnCode?: string;

  @ApiPropertyOptional({ example: 5.0, description: 'GST tax rate percent (0, 5, 12, 18, 28)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(28)
  gstRatePercent?: number;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://storage.localmart.in/products/atta-5kg.jpg'],
    description: 'Product image URLs',
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiPropertyOptional({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'Store category UUID; falls back to store business category if omitted',
  })
  @IsOptional()
  @IsUUID()
  storeCategoryId?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Aashirvaad Superior MP Sharbati Atta 5kg' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: '100% pure MP Sharbati wheat flour' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 320.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  mrp?: number;

  @ApiPropertyOptional({ example: 295.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @ApiPropertyOptional({ example: '11010000' })
  @IsOptional()
  @IsString()
  hsnCode?: string;

  @ApiPropertyOptional({ example: 5.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(28)
  gstRatePercent?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsOptional()
  @IsUUID()
  storeCategoryId?: string;
}

export class CreateProductVariantDto {
  @ApiProperty({ example: '10kg Pack', description: 'Variant name (e.g. size/weight/color)' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'ATT-AASH-10KG', description: 'Variant SKU' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: 600.0, description: 'Variant MRP' })
  @IsNumber()
  @Min(0)
  mrp!: number;

  @ApiProperty({ example: 570.0, description: 'Variant selling price' })
  @IsNumber()
  @Min(0)
  sellingPrice!: number;

  @ApiPropertyOptional({ example: 20, description: 'Initial stock quantity' })
  @IsOptional()
  @IsInt()
  @Min(0)
  initialStockQuantity?: number;

  @ApiPropertyOptional({ example: 3, description: 'Low stock alert threshold' })
  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ example: true, description: 'Auto-disable when out of stock' })
  @IsOptional()
  @IsBoolean()
  autoDisableAtZero?: boolean;
}

export class UpdateProductVariantDto {
  @ApiPropertyOptional({ example: '10kg Economy Pack' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'ATT-AASH-10KG' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ example: 600.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  mrp?: number;

  @ApiPropertyOptional({ example: 560.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ── Store Product Categories ──────────────────────────────────────────────────

export class CreateStoreCategoryDto {
  @ApiProperty({ example: 'Dairy Products', description: 'Category display name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'Parent category UUID — must be the store\'s business vertical or another store-owned category',
  })
  @IsNotEmpty()
  @IsUUID()
  parentCategoryId!: string;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export class GetAnalyticsDto {
  @ApiPropertyOptional({ enum: ['7d', '30d', '90d'], default: '7d', description: 'Analytics time window' })
  @IsOptional()
  period?: '7d' | '30d' | '90d';
}

