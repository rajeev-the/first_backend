import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateProblemTypeDto {
  @ApiProperty({
    description: 'Problem title',
    example: 'Cockroach Infestation Treatment',
  })
  @IsString()
  @IsNotEmpty({ message: 'Problem title is required' })
  @MaxLength(150, { message: 'Title cannot exceed 150 characters' })
  title!: string;

  @ApiPropertyOptional({
    description: 'Problem description or diagnostic guidance',
    example: 'Kitchen and bathroom gel baiting and spray treatment.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Estimated minimum price in INR (₹)',
    example: 499.0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Estimated min price must be a valid number' })
  @Min(0)
  estimatedPriceMin?: number;

  @ApiPropertyOptional({
    description: 'Estimated maximum price in INR (₹)',
    example: 1299.0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Estimated max price must be a valid number' })
  @Min(0)
  estimatedPriceMax?: number;
}
