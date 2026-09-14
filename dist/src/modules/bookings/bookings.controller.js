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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const bookings_service_1 = require("./bookings.service");
const calculate_booking_dto_1 = require("./dto/calculate-booking.dto");
const create_booking_dto_1 = require("./dto/create-booking.dto");
const cancel_booking_dto_1 = require("./dto/cancel-booking.dto");
const update_booking_status_dto_1 = require("./dto/update-booking-status.dto");
const booking_response_dto_1 = require("./dto/booking-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let BookingsController = class BookingsController {
    bookingsService;
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    async calculatePrice(dto) {
        return this.bookingsService.calculatePrice(dto);
    }
    async createBooking(customerId, dto) {
        return this.bookingsService.createBooking(customerId, dto);
    }
    async getCustomerActiveBookings(customerId) {
        return this.bookingsService.getCustomerActiveBookings(customerId);
    }
    async getCustomerBookingHistory(customerId) {
        return this.bookingsService.getCustomerBookingHistory(customerId);
    }
    async getProfessionalActiveBookings(userId) {
        return this.bookingsService.getProfessionalActiveBookings(userId);
    }
    async getProfessionalBookingHistory(userId) {
        return this.bookingsService.getProfessionalBookingHistory(userId);
    }
    async getBookingById(id, userId, userRole) {
        return this.bookingsService.getBookingById(id, userId, userRole);
    }
    async updateBookingStatus(id, userId, userRole, dto) {
        return this.bookingsService.updateBookingStatus(id, userId, userRole, dto);
    }
    async updateBookingStatusPost(id, userId, userRole, dto) {
        return this.bookingsService.updateBookingStatus(id, userId, userRole, dto);
    }
    async cancelBooking(id, userId, userRole, dto) {
        return this.bookingsService.cancelBooking(id, userId, userRole, dto);
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('calculate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '💰 [CUSTOMER] Calculate Visiting Charge Breakdown',
        description: 'Calculates the total visit charge, taxes (18% GST), platform fee, and coupon discounts before placing a booking.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Price calculation breakdown',
        type: calculate_booking_dto_1.BookingPriceCalculationResultDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calculate_booking_dto_1.CalculateBookingPriceDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "calculatePrice", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CUSTOMER, client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN),
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: '📅 [CUSTOMER] Book a Professional Visit',
        description: `Creates an in-person visit booking for the specified professional.
Transitions state to REQUESTED (PENDING), generates a unique tracking booking number, creates an initial visiting charge payment entry, and notifies the professional.`,
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Visit booking created successfully',
        type: booking_response_dto_1.BookingResponseDto,
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_booking_dto_1.CreateBookingDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "createBooking", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CUSTOMER, client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN),
    (0, common_1.Get)('customer/active'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🔄 [CUSTOMER] List Active Ongoing Bookings',
        description: 'Returns all current active / in-progress bookings for the logged-in customer (PENDING, ACCEPTED, ON_THE_WAY, ARRIVED, INSPECTION, DIAGNOSIS_PENDING, QUOTE_CREATED, IN_PROGRESS).',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of active customer bookings',
        type: [booking_response_dto_1.BookingResponseDto],
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getCustomerActiveBookings", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CUSTOMER, client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN),
    (0, common_1.Get)('customer/history'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '📜 [CUSTOMER] List Past / Completed Booking History',
        description: 'Returns all completed, cancelled, or closed bookings for the logged-in customer.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of past booking history',
        type: [booking_response_dto_1.BookingResponseDto],
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getCustomerBookingHistory", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN),
    (0, common_1.Get)('professional/active'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🔄 [PROFESSIONAL] List Active Ongoing / Incoming Bookings',
        description: 'Returns all assigned active / in-progress bookings for the logged-in professional (PENDING, ACCEPTED, ON_THE_WAY, ARRIVED, INSPECTION, DIAGNOSIS_PENDING, QUOTE_CREATED, IN_PROGRESS).',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of active professional bookings',
        type: [booking_response_dto_1.BookingResponseDto],
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getProfessionalActiveBookings", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN),
    (0, common_1.Get)('professional/history'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '📜 [PROFESSIONAL] List Past / Completed Booking History',
        description: 'Returns all completed, cancelled, or closed bookings for the logged-in professional.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of past professional booking history',
        type: [booking_response_dto_1.BookingResponseDto],
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getProfessionalBookingHistory", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🔍 [CUSTOMER/PROFESSIONAL] Get Full Booking Details',
        description: 'Retrieves complete booking details including assigned professional, customer address, scheduled date/time, diagnosis, quote history, payments, and chronological status transition audit trail.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Booking UUID',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Full booking details',
        type: booking_response_dto_1.BookingResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - User does not have permission to view this booking',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Booking not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getBookingById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)(':id/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '⚡ [PROFESSIONAL/CUSTOMER] Update Booking Status Lifecycle',
        description: 'Transitions booking status (e.g. ACCEPTED, ON_THE_WAY, ARRIVED, INSPECTION, IN_PROGRESS, COMPLETED) adhering to state machine rules.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Booking UUID',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Booking status updated successfully',
        type: booking_response_dto_1.BookingResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid state transition',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_booking_status_dto_1.UpdateBookingStatusDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "updateBookingStatus", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(':id/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '⚡ [PROFESSIONAL/CUSTOMER] Update Booking Status Lifecycle (POST alias)',
        description: 'POST alias to transition booking status (e.g. ACCEPTED, ON_THE_WAY, ARRIVED, INSPECTION, IN_PROGRESS, COMPLETED).',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Booking status updated successfully',
        type: booking_response_dto_1.BookingResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_booking_status_dto_1.UpdateBookingStatusDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "updateBookingStatusPost", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '❌ [CUSTOMER/PROFESSIONAL] Cancel Booking',
        description: 'Cancels an active booking in accordance with the backend state machine rules. Only bookings in PENDING, ACCEPTED, or ON_THE_WAY states can be cancelled.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Booking UUID',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Booking cancelled successfully',
        type: booking_response_dto_1.BookingResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid state transition or cancellation not permitted in current state',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, cancel_booking_dto_1.CancelBookingDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "cancelBooking", null);
exports.BookingsController = BookingsController = __decorate([
    (0, swagger_1.ApiTags)('Bookings'),
    (0, common_1.Controller)('bookings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map