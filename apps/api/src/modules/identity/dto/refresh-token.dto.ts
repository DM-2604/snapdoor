// Implements v3 §9.1 — Refresh token DTO

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token from /auth/otp/verify' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
