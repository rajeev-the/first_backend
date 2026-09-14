import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CalculateBookingPriceDto, BookingPriceCalculationResultDto } from './dto/calculate-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
export declare class BookingsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    calculatePrice(dto: CalculateBookingPriceDto): Promise<BookingPriceCalculationResultDto>;
    createBooking(customerId: string, dto: CreateBookingDto): Promise<BookingResponseDto>;
    getBookingById(bookingId: string, userId: string, userRole: UserRole): Promise<BookingResponseDto>;
    getCustomerActiveBookings(customerId: string): Promise<BookingResponseDto[]>;
    getCustomerBookingHistory(customerId: string): Promise<BookingResponseDto[]>;
    getProfessionalActiveBookings(userId: string): Promise<BookingResponseDto[]>;
    getProfessionalBookingHistory(userId: string): Promise<BookingResponseDto[]>;
    updateBookingStatus(bookingId: string, userId: string, userRole: UserRole, dto: UpdateBookingStatusDto): Promise<BookingResponseDto>;
    cancelBooking(bookingId: string, userId: string, userRole: UserRole, dto: CancelBookingDto): Promise<BookingResponseDto>;
    private formatBooking;
}
