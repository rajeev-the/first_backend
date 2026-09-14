import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  QuoteItemType,
  QuoteStatus,
} from '@prisma/client';

export class BookingStatusHistoryItemDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ enum: BookingStatus, example: BookingStatus.ACCEPTED })
  status: BookingStatus;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  changedById?: string | null;

  @ApiPropertyOptional({ example: 'Professional accepted the visit request' })
  notes?: string | null;

  @ApiProperty()
  createdAt: Date;
}

export class BookingPaymentItemDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ enum: PaymentType, example: PaymentType.VISITING_CHARGE })
  paymentType: PaymentType;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.UPI })
  method: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  status: PaymentStatus;

  @ApiProperty({ example: 199.0 })
  amount: number;

  @ApiProperty({ example: 'INR' })
  currency: string;

  @ApiPropertyOptional({ example: 'TXN-9876543210' })
  transactionId?: string | null;

  @ApiProperty()
  createdAt: Date;
}

export class QuoteItemResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: 'Compressor Capacitor Replacement' })
  description: string;

  @ApiProperty({ enum: QuoteItemType, example: QuoteItemType.SPARE_PART })
  itemType: QuoteItemType;

  @ApiProperty({ example: 1.0 })
  quantity: number;

  @ApiProperty({ example: 850.0 })
  unitPrice: number;

  @ApiProperty({ example: 850.0 })
  totalPrice: number;
}

export class BookingQuoteResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: 'QT-20260824-001' })
  quoteNumber: string;

  @ApiProperty({ example: 1200.0 })
  subtotal: number;

  @ApiProperty({ example: 216.0 })
  tax: number;

  @ApiProperty({ example: 0.0 })
  discount: number;

  @ApiProperty({ example: 1416.0 })
  totalAmount: number;

  @ApiProperty({ enum: QuoteStatus, example: QuoteStatus.PENDING_APPROVAL })
  status: QuoteStatus;

  @ApiPropertyOptional({ example: 'Labor warranty included for 90 days' })
  customerNotes?: string | null;

  @ApiPropertyOptional({ type: [QuoteItemResponseDto] })
  items?: QuoteItemResponseDto[];

  @ApiProperty()
  createdAt: Date;
}

export class BookingResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string;

  @ApiProperty({ example: 'BK-20260824-A1B2' })
  bookingNumber: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  customerId: string;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  professionalId?: string | null;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  categoryId: string;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  problemId?: string | null;

  @ApiPropertyOptional({ example: 'AC cooling coil issue and loud rattling noise' })
  problemDescription?: string | null;

  @ApiProperty({
    example: {
      addressLine1: 'Flat 402, Sunshine Heights',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
    },
  })
  address: any;

  @ApiPropertyOptional({ example: 28.6139 })
  latitude?: number | null;

  @ApiPropertyOptional({ example: 77.209 })
  longitude?: number | null;

  @ApiProperty({ example: '2026-08-25T10:00:00.000Z' })
  scheduledDate: Date;

  @ApiProperty({ example: 199.0 })
  visitingCharge: number;

  @ApiProperty({ enum: BookingStatus, example: BookingStatus.PENDING })
  status: BookingStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  professional?: {
    id: string;
    name: string;
    businessName: string | null;
    avatarUrl: string | null;
    phone: string;
    rating: number;
    experienceYears: number;
  } | null;

  @ApiPropertyOptional()
  customer?: {
    id: string;
    name: string | null;
    phone: string;
    email: string | null;
    avatarUrl: string | null;
  };

  @ApiPropertyOptional()
  category?: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  };

  @ApiPropertyOptional()
  problem?: {
    id: string;
    title: string;
    description: string | null;
    estimatedPriceMin: number | null;
    estimatedPriceMax: number | null;
  } | null;

  @ApiPropertyOptional({ type: [BookingPaymentItemDto] })
  payments?: BookingPaymentItemDto[];

  @ApiPropertyOptional({ type: [BookingQuoteResponseDto] })
  quotes?: BookingQuoteResponseDto[];

  @ApiPropertyOptional({ type: [BookingStatusHistoryItemDto] })
  statusHistory?: BookingStatusHistoryItemDto[];
}
