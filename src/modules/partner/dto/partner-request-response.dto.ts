import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PartnerRequestCustomerDto {
  @ApiProperty({ example: '9369d71c-8e72-475c-9c76-2f477038e4a9' })
  id!: string;

  @ApiProperty({ example: 'Pooja Sharma' })
  name!: string;

  @ApiProperty({ example: '+919876543210' })
  phone!: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2' })
  avatarUrl?: string | null;
}

export class PartnerRequestCategoryDto {
  @ApiProperty({ example: '74331644-aff2-4565-89eb-1ec0618ca8b9' })
  id!: string;

  @ApiProperty({ example: 'AC Repair & Service' })
  name!: string;

  @ApiPropertyOptional({ example: 'https://cdn-icons-png.flaticon.com/512/911/911409.png' })
  iconUrl?: string | null;
}

export class PartnerRequestProblemDto {
  @ApiPropertyOptional({ example: '18cfd145-8fe0-410a-8a60-a2924198ee67' })
  id?: string | null;

  @ApiProperty({ example: 'AC Not Cooling' })
  title!: string;

  @ApiPropertyOptional({ example: 'Loud rattling sound and cooling is very low in master bedroom.' })
  description?: string | null;
}

export class PartnerRequestItemDto {
  @ApiProperty({ example: 'e89c3f41-0f4b-4b47-975f-5373a0058b76' })
  id!: string;

  @ApiProperty({ example: 'BK-20260914-A1B2' })
  bookingNumber!: string;

  @ApiProperty({ example: 'REQUESTED' })
  status!: string;

  @ApiProperty({ type: PartnerRequestCustomerDto })
  customer!: PartnerRequestCustomerDto;

  @ApiProperty({ type: PartnerRequestCategoryDto })
  category!: PartnerRequestCategoryDto;

  @ApiProperty({ type: PartnerRequestProblemDto })
  problem!: PartnerRequestProblemDto;

  @ApiProperty({ example: 'Flat 402, Sunshine Heights, Sector 14, New Delhi' })
  address!: string;

  @ApiPropertyOptional({ example: 28.6139 })
  latitude?: number | null;

  @ApiPropertyOptional({ example: 77.2090 })
  longitude?: number | null;

  @ApiProperty({ example: 2.4, description: 'Distance in kilometers from partner to customer' })
  distanceKm!: number;

  @ApiProperty({ example: '2026-09-15T10:00:00.000Z' })
  scheduledDate!: string;

  @ApiProperty({ example: '10:00 AM - 12:00 PM' })
  timeSlot!: string;

  @ApiProperty({ example: 199.0 })
  visitingCharge!: number;

  @ApiProperty({ example: 300, description: 'Remaining seconds before request times out' })
  timeoutSecondsRemaining!: number;

  @ApiProperty({ example: '2026-09-14T09:30:00.000Z' })
  createdAt!: string;
}
