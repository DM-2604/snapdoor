import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateStoreAdminDto {
  @ApiProperty({
    example: '+919876543210',
    description: 'Merchant owner phone number. User is created with STORE_OWNER role if not existing.',
  })
  @IsNotEmpty()
  @IsPhoneNumber('IN')
  ownerPhoneNumber!: string;

  @ApiPropertyOptional({
    example: 'Rajesh Sharma',
    description: 'Merchant owner full name',
  })
  @IsOptional()
  @IsString()
  ownerName?: string;

  @ApiProperty({
    example: 'Sharma Groceries & Dairy',
    description: 'Store display name',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    example: 'SHARMA-BLR',
    description: 'Unique store identifier code (alphanumeric/hyphen). Auto-generated if omitted.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9-]+$/i, { message: 'storeCode may only contain letters, numbers, and hyphens' })
  storeCode?: string;

  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'Platform Category UUID representing this store’s vertical taxonomy',
  })
  @IsNotEmpty()
  @IsUUID()
  businessCategoryId!: string;

  @ApiProperty({
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    description: 'City UUID',
  })
  @IsNotEmpty()
  @IsUUID()
  cityId!: string;

  @ApiPropertyOptional({
    example: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    description: 'Zone UUID',
  })
  @IsOptional()
  @IsUUID()
  zoneId?: string;

  @ApiProperty({
    example: 'Shop #12, 5th Cross, Indiranagar, Bengaluru - 560038',
    description: 'Store physical street address',
  })
  @IsNotEmpty()
  @IsString()
  address!: string;

  @ApiPropertyOptional({
    example: 12.9716,
    description: 'Store latitude coordinate for PostGIS mapping',
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    example: 77.5946,
    description: 'Store longitude coordinate for PostGIS mapping',
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    example: 5.0,
    description: 'Delivery radius in kilometers for this store',
  })
  @IsOptional()
  @IsNumber()
  deliveryRadiusKm?: number;
}
