import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocType, PayoutAccountType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';

export class GetUploadUrlDto {
  @ApiProperty({ example: 'PAN', description: 'Document type' })
  @IsNotEmpty()
  @IsString()
  docType!: string;

  @ApiProperty({ example: 'pan.pdf', description: 'File name' })
  @IsNotEmpty()
  @IsString()
  fileName!: string;

  @ApiProperty({ example: 'application/pdf', description: 'MIME type of the file' })
  @IsNotEmpty()
  @IsString()
  contentType!: string;
}


export class UploadStoreDocumentDto {
  @ApiProperty({
    enum: DocType,
    example: DocType.GST_CERTIFICATE,
    description: 'Document type (PAN, GST_CERTIFICATE, SHOP_LICENSE, AADHAAR, BANK_PROOF, VEHICLE_RC, DRIVING_LICENSE, PROFILE_PHOTO, OTHER)',
  })
  @IsNotEmpty()
  @IsEnum(DocType)
  docType!: DocType;

  @ApiProperty({
    example: 'https://storage.localmart.in/docs/gst-certificate-123.pdf',
    description: 'Public or presigned URL of the uploaded document artifact',
  })
  @IsNotEmpty()
  @IsUrl()
  fileUrl!: string;

  @ApiPropertyOptional({
    example: '2028-12-31',
    description: 'Document expiration date (e.g. license expiry) if applicable',
  })
  @IsOptional()
  @IsString()
  expiresAt?: string;
}

export const UploadKycDocumentDto = UploadStoreDocumentDto;
export type UploadKycDocumentDto = UploadStoreDocumentDto;

export class CreatePayoutAccountDto {
  @ApiProperty({
    enum: PayoutAccountType,
    example: PayoutAccountType.BANK,
    description: 'Account payout type (BANK or UPI)',
  })
  @IsNotEmpty()
  @IsEnum(PayoutAccountType)
  accountType!: PayoutAccountType;

  @ApiPropertyOptional({
    example: 'Sharma Kirana Store',
    description: 'Beneficiary account holder name (Required for BANK)',
  })
  @ValidateIf((o) => o.accountType === PayoutAccountType.BANK)
  @IsNotEmpty()
  @IsString()
  accountHolderName?: string;

  @ApiPropertyOptional({
    example: '98765432101234',
    description: 'Bank account number (Required for BANK)',
  })
  @ValidateIf((o) => o.accountType === PayoutAccountType.BANK)
  @IsNotEmpty()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({
    example: 'HDFC0000123',
    description: 'Bank IFSC Code (Required for BANK)',
  })
  @ValidateIf((o) => o.accountType === PayoutAccountType.BANK)
  @IsNotEmpty()
  @IsString()
  ifscCode?: string;

  @ApiPropertyOptional({
    example: 'sharmakirana@okaxis',
    description: 'UPI Virtual Payment Address (Required for UPI)',
  })
  @ValidateIf((o) => o.accountType === PayoutAccountType.UPI)
  @IsNotEmpty()
  @IsString()
  upiVpa?: string;
}
