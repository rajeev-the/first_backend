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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfessionalProfileDetailDto = exports.ProfessionalReviewDto = exports.ProfessionalServiceItemDto = exports.KycDocumentResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class KycDocumentResponseDto {
    id;
    documentType;
    documentNumber;
    documentUrl;
    status;
    rejectionReason;
    verifiedAt;
    createdAt;
}
exports.KycDocumentResponseDto = KycDocumentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", String)
], KycDocumentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.KycDocumentType, example: client_1.KycDocumentType.AADHAAR }),
    __metadata("design:type", String)
], KycDocumentResponseDto.prototype, "documentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1234-5678-9012' }),
    __metadata("design:type", String)
], KycDocumentResponseDto.prototype, "documentNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://storage.firstchoose.com/kyc/doc.pdf' }),
    __metadata("design:type", String)
], KycDocumentResponseDto.prototype, "documentUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.KycStatus, example: client_1.KycStatus.PENDING }),
    __metadata("design:type", String)
], KycDocumentResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], KycDocumentResponseDto.prototype, "rejectionReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Object)
], KycDocumentResponseDto.prototype, "verifiedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], KycDocumentResponseDto.prototype, "createdAt", void 0);
class ProfessionalServiceItemDto {
    id;
    categoryId;
    categoryName;
    categorySlug;
    categoryIcon;
    customRate;
    isActive;
    createdAt;
}
exports.ProfessionalServiceItemDto = ProfessionalServiceItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", String)
], ProfessionalServiceItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", String)
], ProfessionalServiceItemDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AC Repair' }),
    __metadata("design:type", String)
], ProfessionalServiceItemDto.prototype, "categoryName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ac-repair' }),
    __metadata("design:type", String)
], ProfessionalServiceItemDto.prototype, "categorySlug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://img.icons8.com/color/96/air-conditioner.png' }),
    __metadata("design:type", Object)
], ProfessionalServiceItemDto.prototype, "categoryIcon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 350.0 }),
    __metadata("design:type", Object)
], ProfessionalServiceItemDto.prototype, "customRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ProfessionalServiceItemDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ProfessionalServiceItemDto.prototype, "createdAt", void 0);
class ProfessionalReviewDto {
    id;
    rating;
    comment;
    customerName;
    customerAvatar;
    createdAt;
}
exports.ProfessionalReviewDto = ProfessionalReviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '7d34199c-6a0b-449e-888d-71b31be27a11' }),
    __metadata("design:type", String)
], ProfessionalReviewDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5.0 }),
    __metadata("design:type", Number)
], ProfessionalReviewDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Arrived on time and quickly fixed the AC cooling issue. Very professional!' }),
    __metadata("design:type", Object)
], ProfessionalReviewDto.prototype, "comment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Pooja Sharma' }),
    __metadata("design:type", String)
], ProfessionalReviewDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2' }),
    __metadata("design:type", Object)
], ProfessionalReviewDto.prototype, "customerAvatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ProfessionalReviewDto.prototype, "createdAt", void 0);
class ProfessionalProfileDetailDto {
    id;
    userId;
    name;
    businessName;
    bio;
    avatarUrl;
    experienceYears;
    experience;
    visitingCharge;
    isOnline;
    isAvailable;
    isVerified;
    kycStatus;
    rating;
    totalReviews;
    serviceRadiusKm;
    distance;
    latitude;
    longitude;
    portfolio;
    createdAt;
    updatedAt;
    user;
    services;
    reviews;
    kycDocuments;
}
exports.ProfessionalProfileDetailDto = ProfessionalProfileDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", String)
], ProfessionalProfileDetailDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", String)
], ProfessionalProfileDetailDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Rahul Kumar' }),
    __metadata("design:type", String)
], ProfessionalProfileDetailDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Sharma Cooling & Electrical Solutions' }),
    __metadata("design:type", Object)
], ProfessionalProfileDetailDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Certified HVAC technician with over 8 years of experience' }),
    __metadata("design:type", Object)
], ProfessionalProfileDetailDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a' }),
    __metadata("design:type", Object)
], ProfessionalProfileDetailDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8 }),
    __metadata("design:type", Number)
], ProfessionalProfileDetailDto.prototype, "experienceYears", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8 }),
    __metadata("design:type", Number)
], ProfessionalProfileDetailDto.prototype, "experience", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 199.0 }),
    __metadata("design:type", Number)
], ProfessionalProfileDetailDto.prototype, "visitingCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ProfessionalProfileDetailDto.prototype, "isOnline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ProfessionalProfileDetailDto.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ProfessionalProfileDetailDto.prototype, "isVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.KycStatus, example: client_1.KycStatus.VERIFIED }),
    __metadata("design:type", String)
], ProfessionalProfileDetailDto.prototype, "kycStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4.8 }),
    __metadata("design:type", Number)
], ProfessionalProfileDetailDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 36 }),
    __metadata("design:type", Number)
], ProfessionalProfileDetailDto.prototype, "totalReviews", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15.0 }),
    __metadata("design:type", Number)
], ProfessionalProfileDetailDto.prototype, "serviceRadiusKm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2.4, description: 'Distance in km (if customer lat/lng provided)' }),
    __metadata("design:type", Object)
], ProfessionalProfileDetailDto.prototype, "distance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 28.6139 }),
    __metadata("design:type", Object)
], ProfessionalProfileDetailDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 77.209 }),
    __metadata("design:type", Object)
], ProfessionalProfileDetailDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758'] }),
    __metadata("design:type", Object)
], ProfessionalProfileDetailDto.prototype, "portfolio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ProfessionalProfileDetailDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ProfessionalProfileDetailDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], ProfessionalProfileDetailDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [ProfessionalServiceItemDto] }),
    __metadata("design:type", Array)
], ProfessionalProfileDetailDto.prototype, "services", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [ProfessionalReviewDto] }),
    __metadata("design:type", Array)
], ProfessionalProfileDetailDto.prototype, "reviews", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [KycDocumentResponseDto] }),
    __metadata("design:type", Array)
], ProfessionalProfileDetailDto.prototype, "kycDocuments", void 0);
//# sourceMappingURL=professional-response.dto.js.map