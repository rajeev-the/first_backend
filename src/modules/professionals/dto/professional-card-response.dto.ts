import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfessionalCardDto {
  @ApiProperty({
    description: 'Professional UUID',
    example: 'd9b2d63d-a233-4123-8478-94420e6f66aa',
  })
  id: string;

  @ApiProperty({
    description: 'Professional full name or business display name',
    example: 'Rahul Kumar',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Profile avatar picture URL',
    example: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a',
  })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Bio / tag line of professional',
    example: 'Certified HVAC & Electrical Technician with 8+ years experience',
  })
  bio?: string;

  @ApiProperty({
    description: 'Primary matching service category name',
    example: 'AC Repair',
  })
  category: string;

  @ApiPropertyOptional({
    description: 'Primary matching service category slug',
    example: 'ac-repair',
  })
  categorySlug?: string;

  @ApiProperty({
    description: 'Overall average rating out of 5',
    example: 4.8,
  })
  rating: number;

  @ApiProperty({
    description: 'Total number of customer reviews',
    example: 36,
  })
  totalReviews: number;

  @ApiProperty({
    description: 'Years of professional experience',
    example: 8,
  })
  experience: number;

  @ApiProperty({
    description: 'Visiting / inspection charge in INR (₹)',
    example: 199,
  })
  visitingCharge: number;

  @ApiProperty({
    description: 'Calculated distance from customer location in kilometers',
    example: 2.4,
  })
  distance: number;

  @ApiProperty({
    description: 'Whether the professional has verified KYC credentials',
    example: true,
  })
  isVerified: boolean;

  @ApiProperty({
    description: 'Whether the professional is currently online and available for bookings',
    example: true,
  })
  isAvailable: boolean;

  @ApiPropertyOptional({
    description: 'Latitude coordinate of professional base location',
    example: 28.6139,
  })
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate of professional base location',
    example: 77.209,
  })
  longitude?: number;
}
