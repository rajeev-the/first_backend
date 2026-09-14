import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KycDocumentType, KycStatus, UserRole, UserStatus } from '@prisma/client';

export class KycDocumentResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ enum: KycDocumentType, example: KycDocumentType.AADHAAR })
  documentType!: KycDocumentType;

  @ApiProperty({ example: '1234-5678-9012' })
  documentNumber!: string;

  @ApiProperty({ example: 'https://storage.firstchoose.com/kyc/doc.pdf' })
  documentUrl!: string;

  @ApiProperty({ enum: KycStatus, example: KycStatus.PENDING })
  status!: KycStatus;

  @ApiPropertyOptional({ example: null })
  rejectionReason?: string | null;

  @ApiPropertyOptional({ example: null })
  verifiedAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;
}

export class ProfessionalServiceItemDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  categoryId!: string;

  @ApiProperty({ example: 'AC Repair' })
  categoryName!: string;

  @ApiProperty({ example: 'ac-repair' })
  categorySlug!: string;

  @ApiPropertyOptional({ example: 'https://img.icons8.com/color/96/air-conditioner.png' })
  categoryIcon?: string | null;

  @ApiPropertyOptional({ example: 350.0 })
  customRate?: number | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;
}

export class ProfessionalReviewDto {
  @ApiProperty({ example: '7d34199c-6a0b-449e-888d-71b31be27a11' })
  id: string;

  @ApiProperty({ example: 5.0 })
  rating: number;

  @ApiPropertyOptional({ example: 'Arrived on time and quickly fixed the AC cooling issue. Very professional!' })
  comment?: string | null;

  @ApiProperty({ example: 'Pooja Sharma' })
  customerName: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2' })
  customerAvatar?: string | null;

  @ApiProperty()
  createdAt: Date;
}

export class ProfessionalProfileDetailDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  userId!: string;

  @ApiPropertyOptional({ example: 'Rahul Kumar' })
  name?: string;

  @ApiPropertyOptional({ example: 'Sharma Cooling & Electrical Solutions' })
  businessName?: string | null;

  @ApiPropertyOptional({ example: 'Certified HVAC technician with over 8 years of experience' })
  bio?: string | null;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a' })
  avatarUrl?: string | null;

  @ApiProperty({ example: 8 })
  experienceYears!: number;

  @ApiProperty({ example: 8 })
  experience!: number;

  @ApiProperty({ example: 199.0 })
  visitingCharge!: number;

  @ApiProperty({ example: true })
  isOnline!: boolean;

  @ApiProperty({ example: true })
  isAvailable!: boolean;

  @ApiProperty({ example: true })
  isVerified!: boolean;

  @ApiProperty({ enum: KycStatus, example: KycStatus.VERIFIED })
  kycStatus!: KycStatus;

  @ApiProperty({ example: 4.8 })
  rating!: number;

  @ApiProperty({ example: 36 })
  totalReviews!: number;

  @ApiProperty({ example: 15.0 })
  serviceRadiusKm!: number;

  @ApiPropertyOptional({ example: 2.4, description: 'Distance in km (if customer lat/lng provided)' })
  distance?: number | null;

  @ApiPropertyOptional({ example: 28.6139 })
  latitude?: number | null;

  @ApiPropertyOptional({ example: 77.209 })
  longitude?: number | null;

  @ApiPropertyOptional({ example: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758'] })
  portfolio?: any;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional()
  user?: {
    id: string;
    phone: string;
    email: string | null;
    name: string | null;
    role: UserRole;
    status: UserStatus;
    avatarUrl: string | null;
  };

  @ApiPropertyOptional({ type: [ProfessionalServiceItemDto] })
  services?: ProfessionalServiceItemDto[];

  @ApiPropertyOptional({ type: [ProfessionalReviewDto] })
  reviews?: ProfessionalReviewDto[];

  @ApiPropertyOptional({ type: [KycDocumentResponseDto] })
  kycDocuments?: KycDocumentResponseDto[];
}
