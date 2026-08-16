// reject-store.dto.ts — terminal rejection (Store.status → REJECTED)
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectStoreDto {
  @ApiProperty({
    description: 'Mandatory reason for permanent rejection. Terminal action — owner cannot resubmit. For a non-terminal "please fix and resubmit", use the /request-changes endpoint.',
    example: 'Fraudulent documents submitted — GST number does not match records.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Rejection reason is required for permanent rejection' })
  reason!: string;
}
