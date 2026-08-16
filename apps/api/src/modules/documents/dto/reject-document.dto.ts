// reject-document.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectDocumentDto {
  @ApiProperty({
    description: 'Reason shown to the store owner when they log in to fix and resubmit. Does NOT change Store.status.',
    example: 'AADHAAR — image is blurry, please re-upload a clear scan.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Rejection reason is required' })
  reason!: string;
}
