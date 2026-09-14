import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { BookingStatus } from '@prisma/client';
import { normalizeBookingStatus } from '../booking-state-machine';

export class UpdateBookingStatusDto {
  @ApiProperty({
    enum: BookingStatus,
    description: 'Target booking status transition (supports aliases like REQUESTED, WAITING_CUSTOMER_APPROVAL, APPROVED, REJECTED)',
    example: BookingStatus.ACCEPTED,
  })
  @IsNotEmpty({ message: 'status is required' })
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? normalizeBookingStatus(value) : value;
    } catch {
      return value;
    }
  })
  @IsEnum(BookingStatus, { message: 'Invalid booking status' })
  status!: BookingStatus;

  @ApiPropertyOptional({
    description: 'Optional transition remarks or note',
    example: 'Started journey to customer location',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({
    description: 'Optional transition remarks or notes',
    example: 'Started journey to customer location',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Optional reason for decline/transition',
    example: 'Unavailable at this time',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
