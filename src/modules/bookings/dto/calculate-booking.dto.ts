import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CalculateBookingPriceDto {
  @ApiProperty({
    description: 'UUID of the professional to visit',
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
    description: 'Optional promotional coupon code',
    example: 'FIRST50',
  })
  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class BookingPriceCalculationResultDto {
  @ApiProperty({ example: 199.0, description: 'Base visiting charge set by the professional' })
  visitingCharge: number;

  @ApiProperty({ example: 35.82, description: 'GST / Government taxes (18%)' })
  taxAmount: number;

  @ApiProperty({ example: 19.0, description: 'Standard platform convenience fee' })
  platformFee: number;

  @ApiProperty({ example: 0.0, description: 'Discount applied from coupon' })
  discountAmount: number;

  @ApiProperty({ example: 253.82, description: 'Final payable amount for booking visit' })
  totalAmount: number;

  @ApiProperty({ example: 'INR', description: 'Currency' })
  currency: string;
}
