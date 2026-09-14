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
var PartnerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const bookings_service_1 = require("../bookings/bookings.service");
const REQUEST_TIMEOUT_SECONDS = 300;
let PartnerService = PartnerService_1 = class PartnerService {
    prisma;
    bookingsService;
    logger = new common_1.Logger(PartnerService_1.name);
    constructor(prisma, bookingsService) {
        this.prisma = prisma;
        this.bookingsService = bookingsService;
    }
    calculateDistanceKm(lat1, lon1, lat2, lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return 2.5;
        }
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10) / 10;
    }
    formatAddress(address) {
        if (!address)
            return 'Customer Address';
        if (typeof address === 'string')
            return address;
        const street = address.street || address.addressLine1 || address.line1 || '';
        const landmark = address.landmark ? `(Near ${address.landmark})` : '';
        const city = address.city || '';
        const state = address.state || '';
        const pincode = address.pincode || '';
        const parts = [street, landmark, city, state, pincode].filter((p) => Boolean(p && p.trim()));
        return parts.length > 0 ? parts.join(', ') : 'Customer Address';
    }
    async getProfessionalForUser(userId) {
        const professional = await this.prisma.professional.findUnique({
            where: { userId },
            include: { user: true },
        });
        if (!professional) {
            throw new common_1.NotFoundException('Professional partner profile not found for current user account.');
        }
        return professional;
    }
    async getIncomingRequests(userId) {
        const professional = await this.getProfessionalForUser(userId);
        const pendingBookings = await this.prisma.booking.findMany({
            where: {
                professionalId: professional.id,
                status: client_1.BookingStatus.PENDING,
            },
            include: {
                customer: true,
                category: true,
                problem: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        const now = Date.now();
        const result = [];
        for (const b of pendingBookings) {
            const elapsedSeconds = Math.floor((now - b.createdAt.getTime()) / 1000);
            const remainingSeconds = Math.max(0, REQUEST_TIMEOUT_SECONDS - elapsedSeconds);
            const customerLat = b.latitude ?? b.address?.latitude ?? b.address?.lat ?? null;
            const customerLng = b.longitude ?? b.address?.longitude ?? b.address?.lng ?? null;
            const distanceKm = this.calculateDistanceKm(professional.latitude, professional.longitude, customerLat, customerLng);
            const scheduledDateStr = b.scheduledDate ? b.scheduledDate.toISOString() : new Date().toISOString();
            const timeSlotStr = b.address?.timeSlot || 'Immediate / As Scheduled';
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
    async acceptRequest(userId, bookingId) {
        const professional = await this.getProfessionalForUser(userId);
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID '${bookingId}' not found.`);
        }
        if (booking.professionalId !== professional.id) {
            throw new common_1.ForbiddenException('This booking request is not assigned to your partner account.');
        }
        if (booking.status !== client_1.BookingStatus.PENDING) {
            throw new common_1.BadRequestException(`Cannot accept booking. Current status is '${booking.status}', expected 'REQUESTED' (PENDING).`);
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: client_1.BookingStatus.ACCEPTED },
            });
            await tx.bookingStatusHistory.create({
                data: {
                    bookingId,
                    status: client_1.BookingStatus.ACCEPTED,
                    changedById: userId,
                    notes: 'Partner accepted the visit booking request.',
                },
            });
        });
        this.logger.log(`[Partner] Booking ${booking.id} accepted by partner ${professional.id}`);
        return this.bookingsService.getBookingById(bookingId, userId, client_1.UserRole.PROFESSIONAL);
    }
    async declineRequest(userId, bookingId, dto) {
        const professional = await this.getProfessionalForUser(userId);
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID '${bookingId}' not found.`);
        }
        if (booking.professionalId !== professional.id) {
            throw new common_1.ForbiddenException('This booking request is not assigned to your partner account.');
        }
        if (booking.status !== client_1.BookingStatus.PENDING) {
            throw new common_1.BadRequestException(`Cannot decline booking. Current status is '${booking.status}', expected 'REQUESTED' (PENDING).`);
        }
        const declineReason = dto.reason || 'Partner was unavailable to accept this request';
        await this.prisma.$transaction(async (tx) => {
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: client_1.BookingStatus.DECLINED },
            });
            await tx.bookingStatusHistory.create({
                data: {
                    bookingId,
                    status: client_1.BookingStatus.DECLINED,
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
    async getActiveJob(userId) {
        const professional = await this.getProfessionalForUser(userId);
        const activeStatuses = [
            client_1.BookingStatus.ACCEPTED,
            client_1.BookingStatus.ON_THE_WAY,
            client_1.BookingStatus.ARRIVED,
            client_1.BookingStatus.INSPECTION,
            client_1.BookingStatus.DIAGNOSIS_PENDING,
            client_1.BookingStatus.QUOTE_CREATED,
            client_1.BookingStatus.QUOTE_APPROVED,
            client_1.BookingStatus.IN_PROGRESS,
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
        return this.bookingsService.getBookingById(activeBooking.id, userId, client_1.UserRole.PROFESSIONAL);
    }
    async updateAvailability(userId, dto) {
        const professional = await this.getProfessionalForUser(userId);
        const data = {};
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
    async getEarnings(userId) {
        const professional = await this.getProfessionalForUser(userId);
        const completedBookings = await this.prisma.booking.findMany({
            where: {
                professionalId: professional.id,
                status: { in: [client_1.BookingStatus.COMPLETED, client_1.BookingStatus.CLOSED] },
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
        const transactions = [];
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
};
exports.PartnerService = PartnerService;
exports.PartnerService = PartnerService = PartnerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bookings_service_1.BookingsService])
], PartnerService);
//# sourceMappingURL=partner.service.js.map