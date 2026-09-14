import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelBookingDto {
  @ApiPropertyOptional({
    description: 'Reason for booking cancellation',
    example: 'Change of plans / booked by mistake',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
