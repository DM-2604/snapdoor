import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google ID token (or mock string / payload in development)',
    example: 'mock-google-token-12345',
  })
  @IsString()
  @IsNotEmpty()
  idToken!: string;

  @ApiPropertyOptional({
    description: 'Optional device ID for session tracking',
  })
  @IsString()
  @IsOptional()
  deviceId?: string;
}
