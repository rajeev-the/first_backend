import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProfessionalProfileDto {
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
    example: 6,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Experience must be a valid number' })
  @Min(0, { message: 'Experience cannot be negative' })
  @Max(60, { message: 'Experience cannot exceed 60 years' })
  experienceYears?: number;

  @ApiPropertyOptional({
    description: 'Standard visiting / inspection charge in INR (₹)',
    example: 299.0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Visiting charge must be a valid number' })
  @Min(0, { message: 'Visiting charge cannot be negative' })
  visitingCharge?: number;

  @ApiPropertyOptional({
    description: 'Availability toggle (true = online & accepting booking requests, false = offline)',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isOnline must be a boolean' })
  isOnline?: boolean;

  @ApiPropertyOptional({
    description: 'Service radius from current/base location in kilometers',
    example: 20.0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Service radius must be a valid number' })
  @Min(1.0, { message: 'Service radius must be at least 1.0 km' })
  @Max(100.0, { message: 'Service radius cannot exceed 100.0 km' })
  serviceRadiusKm?: number;

  @ApiPropertyOptional({
    description: 'Current latitude coordinate',
    example: 19.076,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a valid coordinate' })
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Current longitude coordinate',
    example: 72.8777,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a valid coordinate' })
  @Min(-180)
  @Max(180)
  longitude?: number;
}
