// request-changes.dto.ts — non-terminal: store stays PENDING, owner can fix and resubmit
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestChangesDto {
  @ApiProperty({
    description: 'Mandatory reason shown to the store owner. Store.status remains PENDING — the owner can fix issues and resubmit. NOT a terminal rejection. See DECISIONS.md §2.',
    example: 'AADHAAR photo is blurry — please re-upload a clear scan.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Reason is required when requesting changes' })
  reason!: string;
}
