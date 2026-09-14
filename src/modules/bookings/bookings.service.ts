import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import {
  Prisma,
  BookingStatus,
  PaymentType,
  PaymentStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CalculateBookingPriceDto,
  BookingPriceCalculationResultDto,
} from './dto/calculate-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import {
  ACTIVE_BOOKING_STATUSES,
  HISTORY_BOOKING_STATUSES,
  validateStateTransition,
} from './booking-state-machine';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates the exact visiting charge and tax breakdown for booking a professional.
   */
  async calculatePrice(
    dto: CalculateBookingPriceDto,
  ): Promise<BookingPriceCalculationResultDto> {
    const professional = await this.prisma.professional.findUnique({
      where: { id: dto.professionalId },
    });

    if (!professional) {
      throw new NotFoundException(
        `Professional with ID ${dto.professionalId} not found`,
      );
    }

    const visitingCharge = Number(professional.visitingCharge || 0);
    const platformFee = 19.0;
    const taxRate = 0.18; // 18% GST standard for service aggregation
    const taxAmount = Math.round((visitingCharge + platformFee) * taxRate * 100) / 100;

    let discountAmount = 0.0;
    if (dto.couponCode && dto.couponCode.toUpperCase() === 'FIRST50') {
      discountAmount = Math.min(50.0, visitingCharge);
    }

    const totalAmount =
      Math.round((visitingCharge + platformFee + taxAmount - discountAmount) * 100) /
      100;

    return {
      visitingCharge,
      taxAmount,
      platformFee,
      discountAmount,
      totalAmount,
      currency: 'INR',
    };
  }

  /**
   * Creates a new Visit Booking in REQUESTED (PENDING) state.
   */
  async createBooking(
    customerId: string,
    dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    // 1. Verify Professional
    const professional = await this.prisma.professional.findUnique({
      where: { id: dto.professionalId },
      include: { user: true },
    });

    if (!professional) {
      throw new NotFoundException(`Professional with ID ${dto.professionalId} not found`);
    }

    // 2. Verify Category
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${dto.categoryId} not found`);
    }

    // 3. Verify Problem (if provided)
    if (dto.problemId) {
      const problem = await this.prisma.problemType.findUnique({
        where: { id: dto.problemId },
      });

      if (!problem) {
        throw new NotFoundException(`Problem with ID ${dto.problemId} not found`);
      }
    }

    // 4. Generate unique alphanumeric booking number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingNumber = `BK-${dateStr}-${randomSuffix}`;

    const scheduledDate = new Date(dto.scheduledDate);
    if (isNaN(scheduledDate.getTime())) {
      throw new BadRequestException('Invalid scheduledDate format');
    }

    // 5. Create Booking inside a transaction with status history & initial payment
    const visitingCharge = Number(professional.visitingCharge || 0);

    const booking = await this.prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          bookingNumber,
          customerId,
          professionalId: dto.professionalId,
          categoryId: dto.categoryId,
          problemId: dto.problemId || null,
          problemDescription: dto.problemDescription,
          address: dto.address as unknown as Prisma.InputJsonValue,
          latitude: dto.latitude ?? null,
          longitude: dto.longitude ?? null,
          scheduledDate,
          visitingCharge: new Prisma.Decimal(visitingCharge),
          status: BookingStatus.PENDING,
        },
      });

      // Status History Log
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: createdBooking.id,
          status: BookingStatus.PENDING,
          changedById: customerId,
          notes: 'Visit booking requested by customer',
        },
      });

      // Initial Payment Entry
      await tx.payment.create({
        data: {
          bookingId: createdBooking.id,
          paymentType: PaymentType.VISITING_CHARGE,
          method: dto.paymentMethod,
          status: PaymentStatus.PENDING,
          amount: new Prisma.Decimal(visitingCharge),
          currency: 'INR',
        },
      });

      return createdBooking;
    });

    this.logger.log(
      `[Bookings] Booking ${booking.bookingNumber} created by customer ${customerId} for professional ${dto.professionalId}`,
    );

    return this.getBookingById(booking.id, customerId, UserRole.CUSTOMER);
  }

  /**
   * Retrieves full booking details with authorization check.
   */
  async getBookingById(
    bookingId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        professional: {
          include: { user: true },
        },
        category: true,
        problem: true,
        payments: {
          orderBy: { createdAt: 'asc' },
        },
        quotes: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        diagnosis: true,
        serviceExecution: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    // Access control: only customer, assigned professional, or admin can access
    const isCustomer = booking.customerId === userId;
    const isAssignedProf =
      booking.professional?.userId === userId || booking.professionalId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isCustomer && !isAssignedProf && !isAdmin) {
      throw new ForbiddenException('You do not have access to view this booking');
    }

    return this.formatBooking(booking);
  }

  /**
   * Lists customer's currently active / in-flight bookings.
   */
  async getCustomerActiveBookings(
    customerId: string,
  ): Promise<BookingResponseDto[]> {
    // Auto-expire stale test/abandoned bookings older than 3 days still in PENDING or ACCEPTED
    const staleCutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    try {
      await this.prisma.booking.updateMany({
        where: {
          customerId,
          status: { in: [BookingStatus.PENDING, BookingStatus.ACCEPTED] },
          createdAt: { lt: staleCutoff },
        },
        data: {
          status: BookingStatus.CANCELLED,
        },
      });
    } catch (_) {}

    const bookings = await this.prisma.booking.findMany({
      where: {
        customerId,
        status: { in: ACTIVE_BOOKING_STATUSES },
      },
      include: {
        customer: true,
        professional: {
          include: { user: true },
        },
        category: true,
        problem: true,
        payments: {
          orderBy: { createdAt: 'asc' },
        },
        quotes: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { scheduledDate: 'desc' },
    });

    return bookings.map((b) => this.formatBooking(b));
  }

  /**
   * Lists customer's past / completed / cancelled booking history.
   */
  async getCustomerBookingHistory(
    customerId: string,
  ): Promise<BookingResponseDto[]> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        customerId,
        status: { in: HISTORY_BOOKING_STATUSES },
      },
      include: {
        customer: true,
        professional: {
          include: { user: true },
        },
        category: true,
        problem: true,
        payments: {
          orderBy: { createdAt: 'asc' },
        },
        quotes: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map((b) => this.formatBooking(b));
  }

  /**
   * Lists professional's active / incoming assigned bookings.
   */
  async getProfessionalActiveBookings(
    userId: string,
  ): Promise<BookingResponseDto[]> {
    const professional = await this.prisma.professional.findUnique({
      where: { userId },
    });

    if (!professional) {
      return [];
    }

    const bookings = await this.prisma.booking.findMany({
      where: {
        professionalId: professional.id,
        status: { in: ACTIVE_BOOKING_STATUSES },
      },
      include: {
        customer: true,
        professional: {
          include: { user: true },
        },
        category: true,
        problem: true,
        payments: {
          orderBy: { createdAt: 'asc' },
        },
        quotes: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { scheduledDate: 'desc' },
    });

    return bookings.map((b) => this.formatBooking(b));
  }

  /**
   * Lists professional's completed / past booking history.
   */
  async getProfessionalBookingHistory(
    userId: string,
  ): Promise<BookingResponseDto[]> {
    const professional = await this.prisma.professional.findUnique({
      where: { userId },
    });

    if (!professional) {
      return [];
    }

    const bookings = await this.prisma.booking.findMany({
      where: {
        professionalId: professional.id,
        status: { in: HISTORY_BOOKING_STATUSES },
      },
      include: {
        customer: true,
        professional: {
          include: { user: true },
        },
        category: true,
        problem: true,
        payments: {
          orderBy: { createdAt: 'asc' },
        },
        quotes: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map((b) => this.formatBooking(b));
  }

  /**
   * Updates booking status following the state machine rules.
   */
  async updateBookingStatus(
    bookingId: string,
    userId: string,
    userRole: UserRole,
    dto: UpdateBookingStatusDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { professional: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    // Access control: only customer, assigned professional, or admin
    const isCustomer = booking.customerId === userId;
    const isAssignedProf =
      booking.professional?.userId === userId || booking.professionalId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isCustomer && !isAssignedProf && !isAdmin) {
      throw new ForbiddenException('You do not have access to update this booking');
    }

    // Validate state transition
    validateStateTransition(booking.status, dto.status, userRole);

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: dto.status },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          status: dto.status,
          changedById: userId,
          notes:
            dto.note ||
            dto.notes ||
            dto.reason ||
            `Status changed to ${dto.status}`,
        },
      });
    });

    this.logger.log(`[Bookings] Booking ${booking.id} transitioned to ${dto.status} by user ${userId}`);

    return this.getBookingById(bookingId, userId, userRole);
  }

  /**
   * Cancels a booking following strict state machine rules.
   */
  async cancelBooking(
    bookingId: string,
    userId: string,
    userRole: UserRole,
    dto: CancelBookingDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { professional: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    // Access control
    const isCustomer = booking.customerId === userId;
    const isAssignedProf =
      booking.professional?.userId === userId || booking.professionalId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isCustomer && !isAssignedProf && !isAdmin) {
      throw new ForbiddenException('You do not have permission to cancel this booking');
    }

    // Validate state transition through state machine
    validateStateTransition(booking.status, BookingStatus.CANCELLED, userRole);

    const cancelNotes = dto.reason
      ? `Cancelled: ${dto.reason}`
      : 'Cancelled by customer / user request';

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          status: BookingStatus.CANCELLED,
          changedById: userId,
          notes: cancelNotes,
        },
      });
    });

    this.logger.log(`[Bookings] Booking ${booking.id} cancelled by user ${userId}`);

    return this.getBookingById(bookingId, userId, userRole);
  }

  private formatBooking(b: any): BookingResponseDto {
    return {
      id: b.id,
      bookingNumber: b.bookingNumber,
      customerId: b.customerId,
      professionalId: b.professionalId,
      categoryId: b.categoryId,
      problemId: b.problemId,
      problemDescription: b.problemDescription,
      address: b.address,
      latitude: b.latitude,
      longitude: b.longitude,
      scheduledDate: b.scheduledDate,
      visitingCharge: Number(b.visitingCharge),
      status: b.status,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      professional: b.professional
        ? {
            id: b.professional.id,
            name:
              b.professional.user?.name ||
              b.professional.businessName ||
              'Professional Specialist',
            businessName: b.professional.businessName,
            avatarUrl: b.professional.user?.avatarUrl || null,
            phone: b.professional.user?.phone || '',
            rating: Number(b.professional.rating || 0),
            experienceYears: b.professional.experienceYears || 0,
          }
        : null,
      customer: b.customer
        ? {
            id: b.customer.id,
            name: b.customer.name,
            phone: b.customer.phone,
            email: b.customer.email,
            avatarUrl: b.customer.avatarUrl,
          }
        : undefined,
      category: b.category
        ? {
            id: b.category.id,
            name: b.category.name,
            slug: b.category.slug,
            icon: b.category.icon,
          }
        : undefined,
      problem: b.problem
        ? {
            id: b.problem.id,
            title: b.problem.title,
            description: b.problem.description,
            estimatedPriceMin: b.problem.estimatedPriceMin
              ? Number(b.problem.estimatedPriceMin)
              : null,
            estimatedPriceMax: b.problem.estimatedPriceMax
              ? Number(b.problem.estimatedPriceMax)
              : null,
          }
        : null,
      payments: (b.payments || []).map((p: any) => ({
        id: p.id,
        paymentType: p.paymentType,
        method: p.method,
        status: p.status,
        amount: Number(p.amount),
        currency: p.currency,
        transactionId: p.transactionId,
        createdAt: p.createdAt,
      })),
      quotes: (b.quotes || []).map((q: any) => ({
        id: q.id,
        quoteNumber: q.quoteNumber,
        subtotal: Number(q.subtotal),
        tax: Number(q.tax),
        discount: Number(q.discount),
        totalAmount: Number(q.totalAmount),
        status: q.status,
        customerNotes: q.customerNotes,
        createdAt: q.createdAt,
        items: (q.items || []).map((item: any) => ({
          id: item.id,
          description: item.description,
          itemType: item.itemType,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })),
      })),
      statusHistory: (b.statusHistory || []).map((h: any) => ({
        id: h.id,
        status: h.status,
        changedById: h.changedById,
        notes: h.notes,
        createdAt: h.createdAt,
      })),
    };
  }
}
