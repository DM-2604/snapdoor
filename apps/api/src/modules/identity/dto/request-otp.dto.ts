// Implements v3 §9.1 — Request OTP DTO

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'E.164 phone number' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{6,14}$/, { message: 'Phone number must be in E.164 format' })
  phoneNumber!: string;

  @ApiPropertyOptional({
    enum: ['LOGIN', 'STORE_OWNER_ONBOARDING', 'PAYOUT_VERIFICATION'],
    default: 'LOGIN',
  })
  @IsOptional()
  @IsIn(['LOGIN', 'STORE_OWNER_ONBOARDING', 'PAYOUT_VERIFICATION'])
  purpose?: 'LOGIN' | 'STORE_OWNER_ONBOARDING' | 'PAYOUT_VERIFICATION' = 'LOGIN';

  // Set by controller from req.ip or client body
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  deviceFingerprint?: string;
}
