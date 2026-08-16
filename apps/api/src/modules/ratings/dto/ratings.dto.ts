import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'Rating score from 1 to 5', minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ description: 'Customer feedback / review text', example: 'Fresh veggies and fast delivery!' })
  @IsString()
  @IsOptional()
  reviewText?: string;

  @ApiPropertyOptional({ description: 'Photo URLs attached to review', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

export class StoreReplyDto {
  @ApiProperty({ description: 'Store response to customer review', example: 'Thank you for your valuable feedback!' })
  @IsString()
  @IsNotEmpty()
  replyText!: string;
}
