import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProblemTypeResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  categoryId!: string;

  @ApiProperty({ example: 'AC not cooling' })
  title!: string;

  @ApiPropertyOptional({ example: 'Air conditioner is running but not blowing cold air.' })
  description?: string | null;

  @ApiPropertyOptional({ example: 299.0 })
  estimatedPriceMin?: number | null;

  @ApiPropertyOptional({ example: 799.0 })
  estimatedPriceMax?: number | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class CategoryResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'AC Repair' })
  name!: string;

  @ApiProperty({ example: 'ac-repair' })
  slug!: string;

  @ApiPropertyOptional({ example: 'https://assets.firstchoose.com/icons/ac-repair.svg' })
  icon?: string | null;

  @ApiPropertyOptional({ example: 'appliances', description: 'Domain / sector filter category key' })
  filter?: string | null;

  @ApiPropertyOptional({ example: 'Comprehensive AC servicing, cooling diagnosis, gas refill and installation' })
  description?: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiPropertyOptional({ example: 5 })
  problemCount?: number;

  @ApiPropertyOptional({ type: [ProblemTypeResponseDto] })
  problemTypes?: ProblemTypeResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class ProblemDetailResponseDto extends ProblemTypeResponseDto {
  @ApiPropertyOptional({ type: CategoryResponseDto })
  category?: CategoryResponseDto;
}
