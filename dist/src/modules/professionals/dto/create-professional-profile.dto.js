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
exports.CreateProfessionalProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateProfessionalProfileDto {
    businessName;
    bio;
    experienceYears;
    visitingCharge;
    serviceRadiusKm;
    latitude;
    longitude;
    categoryIds;
}
exports.CreateProfessionalProfileDto = CreateProfessionalProfileDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Trading / Business name of the professional or company',
        example: 'Sharma Cooling & Electrical Solutions',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(150, { message: 'Business name cannot exceed 150 characters' }),
    __metadata("design:type", String)
], CreateProfessionalProfileDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Professional bio or summary of experience',
        example: 'Certified HVAC and electrical technician with over 6 years of residential repair experience.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000, { message: 'Bio cannot exceed 1000 characters' }),
    __metadata("design:type", String)
], CreateProfessionalProfileDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Years of field experience',
        example: 5,
        default: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Experience must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Experience cannot be negative' }),
    (0, class_validator_1.Max)(60, { message: 'Experience cannot exceed 60 years' }),
    __metadata("design:type", Number)
], CreateProfessionalProfileDto.prototype, "experienceYears", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Standard visiting / inspection charge in INR (₹)',
        example: 249.0,
        default: 0.0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Visiting charge must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Visiting charge cannot be negative' }),
    __metadata("design:type", Number)
], CreateProfessionalProfileDto.prototype, "visitingCharge", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Service radius from home/base location in kilometers',
        example: 15.0,
        default: 10.0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Service radius must be a valid number' }),
    (0, class_validator_1.Min)(1.0, { message: 'Service radius must be at least 1.0 km' }),
    (0, class_validator_1.Max)(100.0, { message: 'Service radius cannot exceed 100.0 km' }),
    __metadata("design:type", Number)
], CreateProfessionalProfileDto.prototype, "serviceRadiusKm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Base latitude coordinate',
        example: 19.076,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Latitude must be a valid coordinate' }),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], CreateProfessionalProfileDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Base longitude coordinate',
        example: 72.8777,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Longitude must be a valid coordinate' }),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], CreateProfessionalProfileDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Array of Category UUIDs this professional provides services for',
        example: ['3fa85f64-5717-4562-b3fc-2c963f66afa6'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Category IDs must be an array' }),
    (0, class_validator_1.IsUUID)('4', { each: true, message: 'Each category ID must be a valid UUID' }),
    __metadata("design:type", Array)
], CreateProfessionalProfileDto.prototype, "categoryIds", void 0);
//# sourceMappingURL=create-professional-profile.dto.js.map