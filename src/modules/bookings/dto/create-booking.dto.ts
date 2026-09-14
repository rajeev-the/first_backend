import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class BookingAddressDto {
  @ApiProperty({
    example: 'Flat 402, Sunshine Heights, Main Road',
    description: 'Street address / house number',
  })
  @IsNotEmpty({ message: 'addressLine1 is required' })
  @IsString()
  @MaxLength(200)
  addressLine1: string;

  @ApiPropertyOptional({
    example: 'Near Metro Station Gate 2',
    description: 'Secondary address or area',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine2?: string;

  @ApiProperty({ example: 'New Delhi', description: 'City name' })
  @IsNotEmpty({ message: 'city is required' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'Delhi', description: 'State name' })
  @IsNotEmpty({ message: 'state is required' })
  @IsString()
  @MaxLength(100)
  state: string;

  @ApiProperty({ example: '110001', description: 'Postal PIN code' })
  @IsNotEmpty({ message: 'pincode is required' })
  @IsString()
  @MaxLength(10)
  pincode: string;

  @ApiPropertyOptional({ example: 'Opposite City Mall', description: 'Nearby landmark' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  landmark?: string;
}

export class CreateBookingDto {
  @ApiProperty({
    description: 'UUID of the professional being booked',
    example: 'd9b2d63d-a233-4123-8478-94420e6f66aa',
  })
  @IsNotEmpty({ message: 'professionalId is required' })
  @IsUUID('4', { message: 'professionalId must be a valid UUID' })
  professionalId: string;

  @ApiProperty({
    description: 'UUID of the service category',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsNotEmpty({ message: 'categoryId is required' })
  @IsUUID('4', { message: 'categoryId must be a valid UUID' })
  categoryId: string;

  @ApiPropertyOptional({
    description: 'UUID of specific problem type (optional)',
    example: '8fb2d63d-a233-4123-8478-94420e6f66aa',
  })
  @IsOptional()
  @IsUUID('4', { message: 'problemId must be a valid UUID' })
  problemId?: string;

  @ApiProperty({
    description: 'Detailed description of the issue or requirement',
    example: 'AC is making a loud buzzing noise and not cooling properly in the master bedroom.',
  })
  @IsNotEmpty({ message: 'problemDescription is required' })
  @IsString()
  @MaxLength(1500)
  problemDescription: string;

  @ApiProperty({
    description: 'Customer service address details',
    type: BookingAddressDto,
  })
  @IsNotEmpty({ message: 'address is required' })
  @IsObject()
  @ValidateNested()
  @Type(() => BookingAddressDto)
  address: BookingAddressDto;

  @ApiPropertyOptional({ example: 28.6139, description: 'Latitude of customer visit location' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 77.209, description: 'Longitude of customer visit location' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiProperty({
    example: '2026-08-25T10:00:00.000Z',
    description: 'Scheduled visit date and time',
  })
  @IsNotEmpty({ message: 'scheduledDate is required' })
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional({
    example: '10:00 AM - 12:00 PM',
    description: 'Preferred time window for professional arrival',
  })
  @IsOptional()
  @IsString()
  timeSlot?: string;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.UPI,
    description: 'Chosen payment method for visiting charge',
  })
  @IsNotEmpty({ message: 'paymentMethod is required' })
  @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
  paymentMethod: PaymentMethod;
}
