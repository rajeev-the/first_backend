import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DeclineRequestDto {
  @ApiPropertyOptional({
    description: 'Reason for declining the visit request',
    example: 'Currently busy with another repair or out of area',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
