"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BookingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const booking_state_machine_1 = require("./booking-state-machine");
let BookingsService = BookingsService_1 = class BookingsService {
    prisma;
    logger = new common_1.Logger(BookingsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculatePrice(dto) {
        const professional = await this.prisma.professional.findUnique({
            where: { id: dto.professionalId },
        });
        if (!professional) {
            throw new common_1.NotFoundException(`Professional with ID ${dto.professionalId} not found`);
        }
        const visitingCharge = Number(professional.visitingCharge || 0);
        const platformFee = 19.0;
        const taxRate = 0.18;
        const taxAmount = Math.round((visitingCharge + platformFee) * taxRate * 100) / 100;
        let discountAmount = 0.0;
        if (dto.couponCode && dto.couponCode.toUpperCase() === 'FIRST50') {
            discountAmount = Math.min(50.0, visitingCharge);
        }
        const totalAmount = Math.round((visitingCharge + platformFee + taxAmount - discountAmount) * 100) /
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
    async createBooking(customerId, dto) {
        const professional = await this.prisma.professional.findUnique({
            where: { id: dto.professionalId },
            include: { user: true },
        });
        if (!professional) {
            throw new common_1.NotFoundException(`Professional with ID ${dto.professionalId} not found`);
        }
        const category = await this.prisma.serviceCategory.findUnique({
            where: { id: dto.categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${dto.categoryId} not found`);
        }
        let resolvedProblemId = null;
        const isUuid = Boolean(dto.problemId) &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.problemId);
        if (isUuid) {
            const problem = await this.prisma.problemType.findUnique({
                where: { id: dto.problemId },
            });
            if (problem) {
                resolvedProblemId = problem.id;
            }
            else {
                this.logger.warn(`[Bookings] Problem with UUID ${dto.problemId} not found in database.`);
            }
        }
        if (!resolvedProblemId && dto.categoryId) {
            const generalProblem = await this.prisma.problemType.findFirst({
                where: {
                    categoryId: dto.categoryId,
                    isActive: true,
                    OR: [
                        { title: { contains: 'Inspection', mode: 'insensitive' } },
                        { title: { contains: 'Diagnosis', mode: 'insensitive' } },
                        { title: { contains: 'General', mode: 'insensitive' } },
                    ],
                },
            });
            if (generalProblem) {
                resolvedProblemId = generalProblem.id;
                this.logger.log(`[Bookings] Mapped problem key "${dto.problemId || 'general'}" to "${generalProblem.title}" (${generalProblem.id})`);
            }
        }
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const bookingNumber = `BK-${dateStr}-${randomSuffix}`;
        const scheduledDate = new Date(dto.scheduledDate);
        if (isNaN(scheduledDate.getTime())) {
            throw new common_1.BadRequestException('Invalid scheduledDate format');
        }
        const visitingCharge = Number(professional.visitingCharge || 0);
        const booking = await this.prisma.$transaction(async (tx) => {
            const createdBooking = await tx.booking.create({
                data: {
                    bookingNumber,
                    customerId,
                    professionalId: dto.professionalId,
                    categoryId: dto.categoryId,
                    problemId: resolvedProblemId,
                    problemDescription: dto.problemDescription,
                    address: dto.address,
                    latitude: dto.latitude ?? null,
                    longitude: dto.longitude ?? null,
                    scheduledDate,
                    visitingCharge: new client_1.Prisma.Decimal(visitingCharge),
                    status: client_1.BookingStatus.PENDING,
                },
            });
            await tx.bookingStatusHistory.create({
                data: {
                    bookingId: createdBooking.id,
                    status: client_1.BookingStatus.PENDING,
                    changedById: customerId,
                    notes: 'Visit booking requested by customer',
                },
            });
            await tx.payment.create({
                data: {
                    bookingId: createdBooking.id,
                    paymentType: client_1.PaymentType.VISITING_CHARGE,
                    method: dto.paymentMethod,
                    status: client_1.PaymentStatus.PENDING,
                    amount: new client_1.Prisma.Decimal(visitingCharge),
                    currency: 'INR',
                },
            });
            return createdBooking;
        });
        this.logger.log(`[Bookings] Booking ${booking.bookingNumber} created by customer ${customerId} for professional ${dto.professionalId}`);
        return this.getBookingById(booking.id, customerId, client_1.UserRole.CUSTOMER);
    }
    async getBookingById(bookingId, userId, userRole) {
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
            throw new common_1.NotFoundException(`Booking with ID ${bookingId} not found`);
        }
        const isCustomer = booking.customerId === userId;
        const isAssignedProf = booking.professional?.userId === userId || booking.professionalId === userId;
        const isAdmin = userRole === client_1.UserRole.ADMIN;
        if (!isCustomer && !isAssignedProf && !isAdmin) {
            throw new common_1.ForbiddenException('You do not have access to view this booking');
        }
        return this.formatBooking(booking);
    }
    async getCustomerActiveBookings(customerId) {
        const staleCutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        try {
            await this.prisma.booking.updateMany({
                where: {
                    customerId,
                    status: { in: [client_1.BookingStatus.PENDING, client_1.BookingStatus.ACCEPTED] },
                    createdAt: { lt: staleCutoff },
                },
                data: {
                    status: client_1.BookingStatus.CANCELLED,
                },
            });
        }
        catch (_) { }
        const bookings = await this.prisma.booking.findMany({
            where: {
                customerId,
                status: { in: booking_state_machine_1.ACTIVE_BOOKING_STATUSES },
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
    async getCustomerBookingHistory(customerId) {
        const bookings = await this.prisma.booking.findMany({
            where: {
                customerId,
                status: { in: booking_state_machine_1.HISTORY_BOOKING_STATUSES },
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
    async getProfessionalActiveBookings(userId) {
        const professional = await this.prisma.professional.findUnique({
            where: { userId },
        });
        if (!professional) {
            return [];
        }
        const bookings = await this.prisma.booking.findMany({
            where: {
                professionalId: professional.id,
                status: { in: booking_state_machine_1.ACTIVE_BOOKING_STATUSES },
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
    async getProfessionalBookingHistory(userId) {
        const professional = await this.prisma.professional.findUnique({
            where: { userId },
        });
        if (!professional) {
            return [];
        }
        const bookings = await this.prisma.booking.findMany({
            where: {
                professionalId: professional.id,
                status: { in: booking_state_machine_1.HISTORY_BOOKING_STATUSES },
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
    async updateBookingStatus(bookingId, userId, userRole, dto) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { professional: true },
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID ${bookingId} not found`);
        }
        const isCustomer = booking.customerId === userId;
        const isAssignedProf = booking.professional?.userId === userId || booking.professionalId === userId;
        const isAdmin = userRole === client_1.UserRole.ADMIN;
        if (!isCustomer && !isAssignedProf && !isAdmin) {
            throw new common_1.ForbiddenException('You do not have access to update this booking');
        }
        (0, booking_state_machine_1.validateStateTransition)(booking.status, dto.status, userRole);
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
                    notes: dto.note ||
                        dto.notes ||
                        dto.reason ||
                        `Status changed to ${dto.status}`,
                },
            });
        });
        this.logger.log(`[Bookings] Booking ${booking.id} transitioned to ${dto.status} by user ${userId}`);
        return this.getBookingById(bookingId, userId, userRole);
    }
    async cancelBooking(bookingId, userId, userRole, dto) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { professional: true },
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID ${bookingId} not found`);
        }
        const isCustomer = booking.customerId === userId;
        const isAssignedProf = booking.professional?.userId === userId || booking.professionalId === userId;
        const isAdmin = userRole === client_1.UserRole.ADMIN;
        if (!isCustomer && !isAssignedProf && !isAdmin) {
            throw new common_1.ForbiddenException('You do not have permission to cancel this booking');
        }
        (0, booking_state_machine_1.validateStateTransition)(booking.status, client_1.BookingStatus.CANCELLED, userRole);
        const cancelNotes = dto.reason
            ? `Cancelled: ${dto.reason}`
            : 'Cancelled by customer / user request';
        await this.prisma.$transaction(async (tx) => {
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: client_1.BookingStatus.CANCELLED },
            });
            await tx.bookingStatusHistory.create({
                data: {
                    bookingId,
                    status: client_1.BookingStatus.CANCELLED,
                    changedById: userId,
                    notes: cancelNotes,
                },
            });
        });
        this.logger.log(`[Bookings] Booking ${booking.id} cancelled by user ${userId}`);
        return this.getBookingById(bookingId, userId, userRole);
    }
    formatBooking(b) {
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
                    name: b.professional.user?.name ||
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
            payments: (b.payments || []).map((p) => ({
                id: p.id,
                paymentType: p.paymentType,
                method: p.method,
                status: p.status,
                amount: Number(p.amount),
                currency: p.currency,
                transactionId: p.transactionId,
                createdAt: p.createdAt,
            })),
            quotes: (b.quotes || []).map((q) => ({
                id: q.id,
                quoteNumber: q.quoteNumber,
                subtotal: Number(q.subtotal),
                tax: Number(q.tax),
                discount: Number(q.discount),
                totalAmount: Number(q.totalAmount),
                status: q.status,
                customerNotes: q.customerNotes,
                createdAt: q.createdAt,
                items: (q.items || []).map((item) => ({
                    id: item.id,
                    description: item.description,
                    itemType: item.itemType,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                    totalPrice: Number(item.totalPrice),
                })),
            })),
            statusHistory: (b.statusHistory || []).map((h) => ({
                id: h.id,
                status: h.status,
                changedById: h.changedById,
                notes: h.notes,
                createdAt: h.createdAt,
            })),
        };
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = BookingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map