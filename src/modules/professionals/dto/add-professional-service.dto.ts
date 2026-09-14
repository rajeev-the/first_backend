import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class AddProfessionalServiceDto {
  @ApiProperty({
    description: 'Array of Category UUIDs to link to the professional profile',
    example: ['3fa85f64-5717-4562-b3fc-2c963f66afa6'],
  })
  @IsArray({ message: 'Category IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one Category ID must be provided' })
  @IsUUID('4', { each: true, message: 'Each category ID must be a valid UUID' })
  categoryIds!: string[];

  @ApiPropertyOptional({
    description: 'Optional custom rate for these services in INR (₹)',
    example: 350.0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Custom rate must be a valid number' })
  @Min(0, { message: 'Custom rate cannot be negative' })
  customRate?: number;
}
