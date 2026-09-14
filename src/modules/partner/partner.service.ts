import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { BookingStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BookingsService } from '../bookings/bookings.service';
import { PartnerRequestItemDto } from './dto/partner-request-response.dto';
import { DeclineRequestDto } from './dto/decline-request.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { BookingResponseDto } from '../bookings/dto/booking-response.dto';

const REQUEST_TIMEOUT_SECONDS = 300; // 5-minute timer

@Injectable()
export class PartnerService {
  private readonly logger = new Logger(PartnerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingsService: BookingsService,
  ) {}

  /**
   * Helper to compute geodesic distance (in km) between two coordinate pairs using Haversine formula.
   */
  private calculateDistanceKm(
    lat1?: number | null,
    lon1?: number | null,
    lat2?: number | null,
    lon2?: number | null,
  ): number {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
      return 2.5; // Default fallback
    }
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  /**
   * Helper to format human-readable address from JSON object or string.
   */
  private formatAddress(address: any): string {
    if (!address) return 'Customer Address';
    if (typeof address === 'string') return address;
    const street = address.street || address.addressLine1 || address.line1 || '';
    const landmark = address.landmark ? `(Near ${address.landmark})` : '';
    const city = address.city || '';
    const state = address.state || '';
    const pincode = address.pincode || '';
    const parts = [street, landmark, city, state, pincode].filter((p) => Boolean(p && p.trim()));
    return parts.length > 0 ? parts.join(', ') : 'Customer Address';
  }

  /**
   * Helper to resolve the Professional entity for a given User ID.
   */
  private async getProfessionalForUser(userId: string) {
    const professional = await this.prisma.professional.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!professional) {
      throw new NotFoundException(
        'Professional partner profile not found for current user account.',
      );
    }
    return professional;
  }

  /**
   * GET /api/v1/partner/requests
   * Returns incoming visit requests in REQUESTED (PENDING) state for the authenticated partner.
   * Includes Customer, Category, Problem, Distance, Date, Time, Visiting Charge, and 5-min timer.
   */
  async getIncomingRequests(userId: string): Promise<PartnerRequestItemDto[]> {
    const professional = await this.getProfessionalForUser(userId);

    const pendingBookings = await this.prisma.booking.findMany({
      where: {
        professionalId: professional.id,
        status: BookingStatus.PENDING,
      },
      include: {
        customer: true,
        category: true,
        problem: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = Date.now();
    const result: PartnerRequestItemDto[] = [];

    for (const b of pendingBookings) {
      const elapsedSeconds = Math.floor((now - b.createdAt.getTime()) / 1000);
      const remainingSeconds = Math.max(0, REQUEST_TIMEOUT_SECONDS - elapsedSeconds);

      // Extract latitude/longitude from booking or address
      const customerLat = b.latitude ?? (b.address as any)?.latitude ?? (b.address as any)?.lat ?? null;
      const customerLng = b.longitude ?? (b.address as any)?.longitude ?? (b.address as any)?.lng ?? null;

      const distanceKm = this.calculateDistanceKm(
        professional.latitude,
        professional.longitude,
        customerLat,
        customerLng,
      );

      const scheduledDateStr = b.scheduledDate ? b.scheduledDate.toISOString() : new Date().toISOString();
      const timeSlotStr = (b.address as any)?.timeSlot || 'Immediate / As Scheduled';

      result.push({
        id: b.id,
        bookingNumber: b.bookingNumber,
        status: 'REQUESTED',
        customer: {
          id: b.customer.id,
          name: b.customer.name || 'Valued Customer',
          phone: b.customer.phone,
          avatarUrl: b.customer.avatarUrl,
        },
        category: {
          id: b.category.id,
          name: b.category.name,
          iconUrl: b.category.icon,
        },
        problem: {
          id: b.problem?.id ?? null,
          title: b.problem?.title || b.problemDescription || 'General Inspection',
          description: b.problemDescription || b.problem?.description || null,
        },
        address: this.formatAddress(b.address),
        latitude: customerLat,
        longitude: customerLng,
        distanceKm,
        scheduledDate: scheduledDateStr,
        timeSlot: timeSlotStr,
        visitingCharge: Number(b.visitingCharge),
        timeoutSecondsRemaining: remainingSeconds,
        createdAt: b.createdAt.toISOString(),
      });
    }

    return result;
  }

  /**
   * POST /api/v1/partner/requests/:id/accept
   * Accepts an incoming booking request. Transitions state from REQUESTED to ACCEPTED.
   */
  async acceptRequest(userId: string, bookingId: string): Promise<BookingResponseDto> {
    const professional = await this.getProfessionalForUser(userId);

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    if (booking.professionalId !== professional.id) {
      throw new ForbiddenException('This booking request is not assigned to your partner account.');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        `Cannot accept booking. Current status is '${booking.status}', expected 'REQUESTED' (PENDING).`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.ACCEPTED },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          status: BookingStatus.ACCEPTED,
          changedById: userId,
          notes: 'Partner accepted the visit booking request.',
        },
      });
    });

    this.logger.log(`[Partner] Booking ${booking.id} accepted by partner ${professional.id}`);

    return this.bookingsService.getBookingById(bookingId, userId, UserRole.PROFESSIONAL);
  }

  /**
   * POST /api/v1/partner/requests/:id/decline
   * Declines an incoming booking request.
   */
  async declineRequest(
    userId: string,
    bookingId: string,
    dto: DeclineRequestDto,
  ): Promise<{ success: boolean; message: string }> {
    const professional = await this.getProfessionalForUser(userId);

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    if (booking.professionalId !== professional.id) {
      throw new ForbiddenException('This booking request is not assigned to your partner account.');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        `Cannot decline booking. Current status is '${booking.status}', expected 'REQUESTED' (PENDING).`,
      );
    }

    const declineReason = dto.reason || 'Partner was unavailable to accept this request';

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.DECLINED },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          status: BookingStatus.DECLINED,
          changedById: userId,
          notes: `Declined: ${declineReason}`,
        },
      });
    });

    this.logger.log(`[Partner] Booking ${booking.id} declined by partner ${professional.id}`);

    return {
      success: true,
      message: 'Booking request declined successfully.',
    };
  }

  /**
   * GET /api/v1/partner/active-job
   * Returns the single currently active job being executed by the partner.
   * Statuses: ACCEPTED, ON_THE_WAY, ARRIVED, INSPECTION, QUOTE_CREATED, DIAGNOSIS_PENDING, QUOTE_APPROVED, IN_PROGRESS.
   */
  async getActiveJob(userId: string): Promise<BookingResponseDto | null> {
    const professional = await this.getProfessionalForUser(userId);

    const activeStatuses: BookingStatus[] = [
      BookingStatus.ACCEPTED,
      BookingStatus.ON_THE_WAY,
      BookingStatus.ARRIVED,
      BookingStatus.INSPECTION,
      BookingStatus.DIAGNOSIS_PENDING,
      BookingStatus.QUOTE_CREATED,
      BookingStatus.QUOTE_APPROVED,
      BookingStatus.IN_PROGRESS,
    ];

    const activeBooking = await this.prisma.booking.findFirst({
      where: {
        professionalId: professional.id,
        status: { in: activeStatuses },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!activeBooking) {
      return null;
    }

    return this.bookingsService.getBookingById(activeBooking.id, userId, UserRole.PROFESSIONAL);
  }

  /**
   * PATCH /api/v1/partner/availability
   * Updates partner availability (isOnline) and optional live GPS coordinates.
   */
  async updateAvailability(userId: string, dto: UpdateAvailabilityDto) {
    const professional = await this.getProfessionalForUser(userId);

    const data: any = {};
    if (dto.isOnline !== undefined) {
      data.isOnline = dto.isOnline;
    }
    if (dto.latitude !== undefined) {
      data.latitude = dto.latitude;
    }
    if (dto.longitude !== undefined) {
      data.longitude = dto.longitude;
    }

    const updated = await this.prisma.professional.update({
      where: { id: professional.id },
      data,
      include: { user: true },
    });

    return {
      success: true,
      isOnline: updated.isOnline,
      latitude: updated.latitude,
      longitude: updated.longitude,
      message: `Partner is now ${updated.isOnline ? 'Online' : 'Offline'}.`,
    };
  }

  /**
   * Calculates real-time earnings from completed bookings and approved diagnostic quotes.
   */
  async getEarnings(userId: string) {
    const professional = await this.getProfessionalForUser(userId);

    const completedBookings = await this.prisma.booking.findMany({
      where: {
        professionalId: professional.id,
        status: { in: [BookingStatus.COMPLETED, BookingStatus.CLOSED] },
      },
      include: {
        category: true,
        quotes: {
          where: { status: 'APPROVED' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalEarnings = 0;
    let currentMonthEarnings = 0;
    const transactions: any[] = [];

    for (const b of completedBookings) {
      const quoteAmount = b.quotes.reduce((acc, q) => acc + Number(q.totalAmount), 0);
      const bookingEarned = Number(b.visitingCharge) + quoteAmount;

      totalEarnings += bookingEarned;

      if (b.updatedAt >= startOfMonth) {
        currentMonthEarnings += bookingEarned;
      }

      transactions.push({
        id: b.id,
        bookingNumber: b.bookingNumber,
        categoryName: b.category?.name || 'Home Service',
        amount: bookingEarned,
        status: b.status,
        date: b.updatedAt.toISOString(),
      });
    }

    return {
      totalEarnings,
      currentMonthEarnings,
      pendingPayout: 0,
      completedJobsCount: completedBookings.length,
      transactions,
    };
  }
}
