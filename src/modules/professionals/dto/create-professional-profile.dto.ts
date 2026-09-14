import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProfessionalProfileDto {
  @ApiPropertyOptional({
    description: 'Trading / Business name of the professional or company',
    example: 'Sharma Cooling & Electrical Solutions',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150, { message: 'Business name cannot exceed 150 characters' })
  businessName?: string;

  @ApiPropertyOptional({
    description: 'Professional bio or summary of experience',
    example: 'Certified HVAC and electrical technician with over 6 years of residential repair experience.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Bio cannot exceed 1000 characters' })
  bio?: string;

  @ApiPropertyOptional({
    description: 'Years of field experience',
    example: 5,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Experience must be a valid number' })
  @Min(0, { message: 'Experience cannot be negative' })
  @Max(60, { message: 'Experience cannot exceed 60 years' })
  experienceYears?: number;

  @ApiPropertyOptional({
    description: 'Standard visiting / inspection charge in INR (₹)',
    example: 249.0,
    default: 0.0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Visiting charge must be a valid number' })
  @Min(0, { message: 'Visiting charge cannot be negative' })
  visitingCharge?: number;

  @ApiPropertyOptional({
    description: 'Service radius from home/base location in kilometers',
    example: 15.0,
    default: 10.0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Service radius must be a valid number' })
  @Min(1.0, { message: 'Service radius must be at least 1.0 km' })
  @Max(100.0, { message: 'Service radius cannot exceed 100.0 km' })
  serviceRadiusKm?: number;

  @ApiPropertyOptional({
    description: 'Base latitude coordinate',
    example: 19.076,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a valid coordinate' })
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Base longitude coordinate',
    example: 72.8777,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a valid coordinate' })
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Array of Category UUIDs this professional provides services for',
    example: ['3fa85f64-5717-4562-b3fc-2c963f66afa6'],
  })
  @IsOptional()
  @IsArray({ message: 'Category IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each category ID must be a valid UUID' })
  categoryIds?: string[];
}
