import { BookingStatus, PaymentMethod, PaymentStatus, PaymentType, QuoteItemType, QuoteStatus } from '@prisma/client';
export declare class BookingStatusHistoryItemDto {
    id: string;
    status: BookingStatus;
    changedById?: string | null;
    notes?: string | null;
    createdAt: Date;
}
export declare class BookingPaymentItemDto {
    id: string;
    paymentType: PaymentType;
    method: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    currency: string;
    transactionId?: string | null;
    createdAt: Date;
}
export declare class QuoteItemResponseDto {
    id: string;
    description: string;
    itemType: QuoteItemType;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
export declare class BookingQuoteResponseDto {
    id: string;
    quoteNumber: string;
    subtotal: number;
    tax: number;
    discount: number;
    totalAmount: number;
    status: QuoteStatus;
    customerNotes?: string | null;
    items?: QuoteItemResponseDto[];
    createdAt: Date;
}
export declare class BookingResponseDto {
    id: string;
    bookingNumber: string;
    customerId: string;
    professionalId?: string | null;
    categoryId: string;
    problemId?: string | null;
    problemDescription?: string | null;
    address: any;
    latitude?: number | null;
    longitude?: number | null;
    scheduledDate: Date;
    visitingCharge: number;
    status: BookingStatus;
    createdAt: Date;
    updatedAt: Date;
    professional?: {
        id: string;
        name: string;
        businessName: string | null;
        avatarUrl: string | null;
        phone: string;
        rating: number;
        experienceYears: number;
    } | null;
    customer?: {
        id: string;
        name: string | null;
        phone: string;
        email: string | null;
        avatarUrl: string | null;
    };
    category?: {
        id: string;
        name: string;
        slug: string;
        icon: string | null;
    };
    problem?: {
        id: string;
        title: string;
        description: string | null;
        estimatedPriceMin: number | null;
        estimatedPriceMax: number | null;
    } | null;
    payments?: BookingPaymentItemDto[];
    quotes?: BookingQuoteResponseDto[];
    statusHistory?: BookingStatusHistoryItemDto[];
}
