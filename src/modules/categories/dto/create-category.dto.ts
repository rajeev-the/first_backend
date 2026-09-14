import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Pest Control',
  })
  @IsString()
  @IsNotEmpty({ message: 'Category name is required' })
  @MaxLength(100, { message: 'Category name cannot exceed 100 characters' })
  name!: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug (auto-generated from name if omitted)',
    example: 'pest-control',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({
    description: 'Icon URL or asset identifier for the category',
    example: 'https://img.icons8.com/color/96/pest-control.png',
  })
  @IsOptional()
  @IsString({ message: 'Icon must be a string or valid URL' })
  icon?: string;

  @ApiPropertyOptional({
    description: 'Domain filter key (e.g. repairs, appliances, cleaning, automotive, tech, interiors)',
    example: 'cleaning',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  filter?: string;

  @ApiPropertyOptional({
    description: 'Description of the service category',
    example: 'Termite, cockroach, rodent, and bed bug extermination treatments.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
