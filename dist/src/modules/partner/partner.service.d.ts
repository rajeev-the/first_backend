import { PrismaService } from '../prisma/prisma.service';
import { BookingsService } from '../bookings/bookings.service';
import { PartnerRequestItemDto } from './dto/partner-request-response.dto';
import { DeclineRequestDto } from './dto/decline-request.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { BookingResponseDto } from '../bookings/dto/booking-response.dto';
export declare class PartnerService {
    private readonly prisma;
    private readonly bookingsService;
    private readonly logger;
    constructor(prisma: PrismaService, bookingsService: BookingsService);
    private calculateDistanceKm;
    private formatAddress;
    private getProfessionalForUser;
    getIncomingRequests(userId: string): Promise<PartnerRequestItemDto[]>;
    acceptRequest(userId: string, bookingId: string): Promise<BookingResponseDto>;
    declineRequest(userId: string, bookingId: string, dto: DeclineRequestDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getActiveJob(userId: string): Promise<BookingResponseDto | null>;
    updateAvailability(userId: string, dto: UpdateAvailabilityDto): Promise<{
        success: boolean;
        isOnline: boolean;
        latitude: number | null;
        longitude: number | null;
        message: string;
    }>;
    getEarnings(userId: string): Promise<{
        totalEarnings: number;
        currentMonthEarnings: number;
        pendingPayout: number;
        completedJobsCount: number;
        transactions: any[];
    }>;
}
