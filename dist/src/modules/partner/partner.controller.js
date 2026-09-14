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
exports.PartnerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const partner_service_1 = require("./partner.service");
const partner_request_response_dto_1 = require("./dto/partner-request-response.dto");
const decline_request_dto_1 = require("./dto/decline-request.dto");
const update_availability_dto_1 = require("./dto/update-availability.dto");
const booking_response_dto_1 = require("../bookings/dto/booking-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let PartnerController = class PartnerController {
    partnerService;
    constructor(partnerService) {
        this.partnerService = partnerService;
    }
    async getIncomingRequests(userId) {
        return this.partnerService.getIncomingRequests(userId);
    }
    async acceptRequest(bookingId, userId) {
        return this.partnerService.acceptRequest(userId, bookingId);
    }
    async declineRequest(bookingId, userId, dto) {
        return this.partnerService.declineRequest(userId, bookingId, dto);
    }
    async getActiveJob(userId) {
        return this.partnerService.getActiveJob(userId);
    }
    async updateAvailability(userId, dto) {
        return this.partnerService.updateAvailability(userId, dto);
    }
    async getEarnings(userId) {
        return this.partnerService.getEarnings(userId);
    }
};
exports.PartnerController = PartnerController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN),
    (0, common_1.Get)('requests'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '📋 [PARTNER] Get Incoming Visit Requests',
        description: 'Fetches new visit requests in REQUESTED (PENDING) status for the authenticated partner. Includes Customer, Category, Problem, Distance, Date, Time, Visiting Charge, and remaining seconds on the 5-minute timer.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of incoming visit requests',
        type: [partner_request_response_dto_1.PartnerRequestItemDto],
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PartnerController.prototype, "getIncomingRequests", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN),
    (0, common_1.Post)('requests/:id/accept'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '✅ [PARTNER] Accept Visit Request',
        description: 'Professional accepts the visit request before the 5-minute timeout. Transitions booking state from REQUESTED to ACCEPTED.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Booking UUID',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Visit request accepted successfully',
        type: booking_response_dto_1.BookingResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PartnerController.prototype, "acceptRequest", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN),
    (0, common_1.Post)('requests/:id/decline'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '❌ [PARTNER] Decline Visit Request',
        description: 'Professional declines the visit request. Transitions booking state to DECLINED.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Booking UUID',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Visit request declined successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, decline_request_dto_1.DeclineRequestDto]),
    __metadata("design:returntype", Promise)
], PartnerController.prototype, "declineRequest", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN),
    (0, common_1.Get)('active-job'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🛠️ [PARTNER] Get Single Currently Active Ongoing Job',
        description: 'Fetches the single currently active job being executed by the partner (in ACCEPTED, ON_THE_WAY, ARRIVED, INSPECTION, QUOTE_CREATED, WAITING_CUSTOMER_APPROVAL, APPROVED, or IN_PROGRESS status). Returns null if no active job.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Active job details or null',
        type: booking_response_dto_1.BookingResponseDto,
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PartnerController.prototype, "getActiveJob", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN),
    (0, common_1.Patch)('availability'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '📡 [PARTNER] Update Availability & Live Location',
        description: 'Toggles online/offline status (isOnline) and optionally updates live GPS latitude/longitude.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Availability updated successfully',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_availability_dto_1.UpdateAvailabilityDto]),
    __metadata("design:returntype", Promise)
], PartnerController.prototype, "updateAvailability", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN),
    (0, common_1.Get)('earnings'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '💰 [PARTNER] Get Real-time Earnings & Transaction Breakdown',
        description: 'Calculates total earnings, current month earnings, completed jobs count, and transaction log for the authenticated partner.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Partner earnings metrics',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PartnerController.prototype, "getEarnings", null);
exports.PartnerController = PartnerController = __decorate([
    (0, swagger_1.ApiTags)('Partner'),
    (0, common_1.Controller)('partner'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [partner_service_1.PartnerService])
], PartnerController);
//# sourceMappingURL=partner.controller.js.map