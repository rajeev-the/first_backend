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
exports.ProfessionalsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const professionals_service_1 = require("./professionals.service");
const create_professional_profile_dto_1 = require("./dto/create-professional-profile.dto");
const update_professional_profile_dto_1 = require("./dto/update-professional-profile.dto");
const add_professional_service_dto_1 = require("./dto/add-professional-service.dto");
const submit_kyc_dto_1 = require("./dto/submit-kyc.dto");
const professional_response_dto_1 = require("./dto/professional-response.dto");
const discover_professionals_query_dto_1 = require("./dto/discover-professionals-query.dto");
const professional_card_response_dto_1 = require("./dto/professional-card-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ProfessionalsController = class ProfessionalsController {
    professionalsService;
    constructor(professionalsService) {
        this.professionalsService = professionalsService;
    }
    async findNearby(query) {
        return this.professionalsService.findNearbyProfessionals(query);
    }
    async getPublicProfile(id, lat, lng) {
        return this.professionalsService.getPublicProfile(id, lat !== undefined ? Number(lat) : undefined, lng !== undefined ? Number(lng) : undefined);
    }
    async createProfile(userId, dto) {
        return this.professionalsService.createOrUpdateProfile(userId, dto);
    }
    async getMyProfile(userId) {
        return this.professionalsService.getMyProfile(userId);
    }
    async updateMyProfile(userId, dto) {
        return this.professionalsService.updateMyProfile(userId, dto);
    }
    async addServices(userId, dto) {
        return this.professionalsService.addServices(userId, dto);
    }
    async getMyServices(userId) {
        return this.professionalsService.getMyServices(userId);
    }
    async submitKyc(userId, dto) {
        return this.professionalsService.submitKyc(userId, dto);
    }
};
exports.ProfessionalsController = ProfessionalsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('nearby'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🌍 [CUSTOMER] Discover Nearby Professionals (PostGIS / Geospatial)',
        description: `Discovers nearby verified and active service professionals based on customer coordinates.
Supports PostGIS / spherical distance calculation, radius filtering, category slug/ID matching, rating threshold, live availability toggle, and smart ranking algorithms.`,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of matching nearby professional cards ranked by relevance/distance',
        type: [professional_card_response_dto_1.ProfessionalCardDto],
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [discover_professionals_query_dto_1.DiscoverProfessionalsQueryDto]),
    __metadata("design:returntype", Promise)
], ProfessionalsController.prototype, "findNearby", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '👤 [PUBLIC] Get Professional Profile, Services & Customer Reviews',
        description: `Fetches comprehensive public profile for a professional including name, avatar, bio, verification status, experience, visiting charge, offered services, portfolio images, customer ratings, and verified reviews.
If optional customer lat/lng are provided in query parameters, returns dynamic distance in kilometers.`,
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Professional UUID or User UUID',
        example: 'd9b2d63d-a233-4123-8478-94420e6f66aa',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'lat',
        required: false,
        type: Number,
        description: 'Customer latitude for dynamic distance computation',
        example: 28.6139,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'lng',
        required: false,
        type: Number,
        description: 'Customer longitude for dynamic distance computation',
        example: 77.209,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Complete professional public profile and review history',
        type: professional_response_dto_1.ProfessionalProfileDetailDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Professional not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('lat')),
    __param(2, (0, common_1.Query)('lng')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], ProfessionalsController.prototype, "getPublicProfile", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CUSTOMER, client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN),
    (0, common_1.Post)('profile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: '🔒 [PROFESSIONAL] Create or Initialize Professional Profile',
        description: '🔒 **Required Role:** `CUSTOMER`, `PROFESSIONAL`, or `ADMIN`\n\nInitializes the professional business profile, visiting charge, service radius, and category links.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Professional profile created successfully',
        type: professional_response_dto_1.ProfessionalProfileDetailDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_professional_profile_dto_1.CreateProfessionalProfileDto]),
    __metadata("design:returntype", Promise)
], ProfessionalsController.prototype, "createProfile", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CUSTOMER, client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN),
    (0, common_1.Get)('me/profile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🔒 [PROFESSIONAL] Get Current Professional Profile',
        description: '🔒 **Required Role:** `CUSTOMER`, `PROFESSIONAL`, or `ADMIN`\n\nReturns complete profile details for the authenticated professional, including services and KYC status.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Professional profile retrieved',
        type: professional_response_dto_1.ProfessionalProfileDetailDto,
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProfessionalsController.prototype, "getMyProfile", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN),
    (0, common_1.Patch)('me/profile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🔒 [PROFESSIONAL] Update Availability / Charges / Location',
        description: '🔒 **Required Role:** `PROFESSIONAL` or `ADMIN`\n\nUpdates bio, visiting charges, online/offline availability toggle (`isOnline: true/false`), location coordinates, and service radius.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Professional profile updated successfully',
        type: professional_response_dto_1.ProfessionalProfileDetailDto,
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_professional_profile_dto_1.UpdateProfessionalProfileDto]),
    __metadata("design:returntype", Promise)
], ProfessionalsController.prototype, "updateMyProfile", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN),
    (0, common_1.Post)('services'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: '🔒 [PROFESSIONAL] Link Service Categories',
        description: '🔒 **Required Role:** `PROFESSIONAL` or `ADMIN`\n\nLinks one or more service categories (e.g. AC Repair, Electrical) to the professional catalog.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Services linked successfully',
        type: [professional_response_dto_1.ProfessionalServiceItemDto],
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_professional_service_dto_1.AddProfessionalServiceDto]),
    __metadata("design:returntype", Promise)
], ProfessionalsController.prototype, "addServices", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN),
    (0, common_1.Get)('me/services'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🔒 [PROFESSIONAL] List Professional Linked Services',
        description: '🔒 **Required Role:** `PROFESSIONAL` or `ADMIN`\n\nReturns all categories/services linked to the authenticated professional.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of linked services',
        type: [professional_response_dto_1.ProfessionalServiceItemDto],
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProfessionalsController.prototype, "getMyServices", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.PROFESSIONAL, client_1.UserRole.ADMIN),
    (0, common_1.Post)('kyc'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: '🔒 [PROFESSIONAL] Submit KYC Document',
        description: '🔒 **Required Role:** `PROFESSIONAL` or `ADMIN`\n\nUploads/submits government ID (Aadhaar, PAN, Trade License) for admin verification.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'KYC document submitted and marked as PENDING',
        type: professional_response_dto_1.KycDocumentResponseDto,
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, submit_kyc_dto_1.SubmitKycDto]),
    __metadata("design:returntype", Promise)
], ProfessionalsController.prototype, "submitKyc", null);
exports.ProfessionalsController = ProfessionalsController = __decorate([
    (0, swagger_1.ApiTags)('Professionals'),
    (0, common_1.Controller)('professionals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [professionals_service_1.ProfessionalsService])
], ProfessionalsController);
//# sourceMappingURL=professionals.controller.js.map