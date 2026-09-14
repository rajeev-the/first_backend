import { BookingStatus } from '@prisma/client';
export declare class UpdateBookingStatusDto {
    status: BookingStatus;
    note?: string;
    notes?: string;
    reason?: string;
}
