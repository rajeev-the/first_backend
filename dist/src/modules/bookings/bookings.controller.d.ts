import { UserRole } from '@prisma/client';
import { BookingsService } from './bookings.service';
import { CalculateBookingPriceDto, BookingPriceCalculationResultDto } from './dto/calculate-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    calculatePrice(dto: CalculateBookingPriceDto): Promise<BookingPriceCalculationResultDto>;
    createBooking(customerId: string, dto: CreateBookingDto): Promise<BookingResponseDto>;
    getCustomerActiveBookings(customerId: string): Promise<BookingResponseDto[]>;
    getCustomerBookingHistory(customerId: string): Promise<BookingResponseDto[]>;
    getProfessionalActiveBookings(userId: string): Promise<BookingResponseDto[]>;
    getProfessionalBookingHistory(userId: string): Promise<BookingResponseDto[]>;
    getBookingById(id: string, userId: string, userRole: UserRole): Promise<BookingResponseDto>;
    updateBookingStatus(id: string, userId: string, userRole: UserRole, dto: UpdateBookingStatusDto): Promise<BookingResponseDto>;
    updateBookingStatusPost(id: string, userId: string, userRole: UserRole, dto: UpdateBookingStatusDto): Promise<BookingResponseDto>;
    cancelBooking(id: string, userId: string, userRole: UserRole, dto: CancelBookingDto): Promise<BookingResponseDto>;
}
