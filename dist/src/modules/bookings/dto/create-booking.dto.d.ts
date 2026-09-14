import { PaymentMethod } from '@prisma/client';
export declare class BookingAddressDto {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
}
export declare class CreateBookingDto {
    professionalId: string;
    categoryId: string;
    problemId?: string;
    problemDescription: string;
    address: BookingAddressDto;
    latitude?: number;
    longitude?: number;
    scheduledDate: string;
    timeSlot?: string;
    paymentMethod: PaymentMethod;
}
