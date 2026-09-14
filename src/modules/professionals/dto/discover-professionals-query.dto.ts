import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum ProfessionalSortBy {
  RECOMMENDED = 'recommended',
  DISTANCE = 'distance',
  RATING = 'rating',
  EXPERIENCE = 'experience',
  PRICE_LOW_TO_HIGH = 'price_low_to_high',
}

export class DiscoverProfessionalsQueryDto {
  @ApiProperty({
    description: 'Customer current latitude coordinate',
    example: 28.6139,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'lat must be a valid number' })
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({
    description: 'Customer current longitude coordinate',
    example: 77.209,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'lng must be a valid number' })
  @Min(-180)
  @Max(180)
  lng: number;

  @ApiPropertyOptional({
    description: 'Search radius in kilometers',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'radius must be a valid number' })
  @Min(0.1, { message: 'radius must be at least 0.1 km' })
  @Max(100, { message: 'radius cannot exceed 100 km' })
  radius?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by category slug (e.g. "ac-repair") or category UUID',
    example: 'ac-repair',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Minimum rating threshold (0.0 - 5.0)',
    example: 4.5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'rating must be a valid number' })
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Filter by online/live availability (true for only active/online)',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return value;
  })
  @IsBoolean()
  availability?: boolean;

  @ApiPropertyOptional({
    description: 'Sorting criteria',
    enum: ProfessionalSortBy,
    default: ProfessionalSortBy.RECOMMENDED,
  })
  @IsOptional()
  @IsEnum(ProfessionalSortBy)
  sortBy?: ProfessionalSortBy = ProfessionalSortBy.RECOMMENDED;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
