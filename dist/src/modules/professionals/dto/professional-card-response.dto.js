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
exports.ProfessionalCardDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ProfessionalCardDto {
    id;
    name;
    avatarUrl;
    bio;
    category;
    categorySlug;
    rating;
    totalReviews;
    experience;
    visitingCharge;
    distance;
    isVerified;
    isAvailable;
    latitude;
    longitude;
}
exports.ProfessionalCardDto = ProfessionalCardDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Professional UUID',
        example: 'd9b2d63d-a233-4123-8478-94420e6f66aa',
    }),
    __metadata("design:type", String)
], ProfessionalCardDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Professional full name or business display name',
        example: 'Rahul Kumar',
    }),
    __metadata("design:type", String)
], ProfessionalCardDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Profile avatar picture URL',
        example: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a',
    }),
    __metadata("design:type", String)
], ProfessionalCardDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Bio / tag line of professional',
        example: 'Certified HVAC & Electrical Technician with 8+ years experience',
    }),
    __metadata("design:type", String)
], ProfessionalCardDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Primary matching service category name',
        example: 'AC Repair',
    }),
    __metadata("design:type", String)
], ProfessionalCardDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Primary matching service category slug',
        example: 'ac-repair',
    }),
    __metadata("design:type", String)
], ProfessionalCardDto.prototype, "categorySlug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Overall average rating out of 5',
        example: 4.8,
    }),
    __metadata("design:type", Number)
], ProfessionalCardDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of customer reviews',
        example: 36,
    }),
    __metadata("design:type", Number)
], ProfessionalCardDto.prototype, "totalReviews", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Years of professional experience',
        example: 8,
    }),
    __metadata("design:type", Number)
], ProfessionalCardDto.prototype, "experience", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Visiting / inspection charge in INR (₹)',
        example: 199,
    }),
    __metadata("design:type", Number)
], ProfessionalCardDto.prototype, "visitingCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Calculated distance from customer location in kilometers',
        example: 2.4,
    }),
    __metadata("design:type", Number)
], ProfessionalCardDto.prototype, "distance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the professional has verified KYC credentials',
        example: true,
    }),
    __metadata("design:type", Boolean)
], ProfessionalCardDto.prototype, "isVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the professional is currently online and available for bookings',
        example: true,
    }),
    __metadata("design:type", Boolean)
], ProfessionalCardDto.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Latitude coordinate of professional base location',
        example: 28.6139,
    }),
    __metadata("design:type", Number)
], ProfessionalCardDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Longitude coordinate of professional base location',
        example: 77.209,
    }),
    __metadata("design:type", Number)
], ProfessionalCardDto.prototype, "longitude", void 0);
//# sourceMappingURL=professional-card-response.dto.js.map