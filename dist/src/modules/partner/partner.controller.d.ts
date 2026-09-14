import { PartnerService } from './partner.service';
import { PartnerRequestItemDto } from './dto/partner-request-response.dto';
import { DeclineRequestDto } from './dto/decline-request.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { BookingResponseDto } from '../bookings/dto/booking-response.dto';
export declare class PartnerController {
    private readonly partnerService;
    constructor(partnerService: PartnerService);
    getIncomingRequests(userId: string): Promise<PartnerRequestItemDto[]>;
    acceptRequest(bookingId: string, userId: string): Promise<BookingResponseDto>;
    declineRequest(bookingId: string, userId: string, dto: DeclineRequestDto): Promise<{
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
