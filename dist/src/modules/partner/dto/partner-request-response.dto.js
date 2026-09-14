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
exports.PartnerRequestItemDto = exports.PartnerRequestProblemDto = exports.PartnerRequestCategoryDto = exports.PartnerRequestCustomerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class PartnerRequestCustomerDto {
    id;
    name;
    phone;
    avatarUrl;
}
exports.PartnerRequestCustomerDto = PartnerRequestCustomerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '9369d71c-8e72-475c-9c76-2f477038e4a9' }),
    __metadata("design:type", String)
], PartnerRequestCustomerDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Pooja Sharma' }),
    __metadata("design:type", String)
], PartnerRequestCustomerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+919876543210' }),
    __metadata("design:type", String)
], PartnerRequestCustomerDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2' }),
    __metadata("design:type", Object)
], PartnerRequestCustomerDto.prototype, "avatarUrl", void 0);
class PartnerRequestCategoryDto {
    id;
    name;
    iconUrl;
}
exports.PartnerRequestCategoryDto = PartnerRequestCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '74331644-aff2-4565-89eb-1ec0618ca8b9' }),
    __metadata("design:type", String)
], PartnerRequestCategoryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AC Repair & Service' }),
    __metadata("design:type", String)
], PartnerRequestCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://cdn-icons-png.flaticon.com/512/911/911409.png' }),
    __metadata("design:type", Object)
], PartnerRequestCategoryDto.prototype, "iconUrl", void 0);
class PartnerRequestProblemDto {
    id;
    title;
    description;
}
exports.PartnerRequestProblemDto = PartnerRequestProblemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '18cfd145-8fe0-410a-8a60-a2924198ee67' }),
    __metadata("design:type", Object)
], PartnerRequestProblemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AC Not Cooling' }),
    __metadata("design:type", String)
], PartnerRequestProblemDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Loud rattling sound and cooling is very low in master bedroom.' }),
    __metadata("design:type", Object)
], PartnerRequestProblemDto.prototype, "description", void 0);
class PartnerRequestItemDto {
    id;
    bookingNumber;
    status;
    customer;
    category;
    problem;
    address;
    latitude;
    longitude;
    distanceKm;
    scheduledDate;
    timeSlot;
    visitingCharge;
    timeoutSecondsRemaining;
    createdAt;
}
exports.PartnerRequestItemDto = PartnerRequestItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'e89c3f41-0f4b-4b47-975f-5373a0058b76' }),
    __metadata("design:type", String)
], PartnerRequestItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'BK-20260914-A1B2' }),
    __metadata("design:type", String)
], PartnerRequestItemDto.prototype, "bookingNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'REQUESTED' }),
    __metadata("design:type", String)
], PartnerRequestItemDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PartnerRequestCustomerDto }),
    __metadata("design:type", PartnerRequestCustomerDto)
], PartnerRequestItemDto.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PartnerRequestCategoryDto }),
    __metadata("design:type", PartnerRequestCategoryDto)
], PartnerRequestItemDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PartnerRequestProblemDto }),
    __metadata("design:type", PartnerRequestProblemDto)
], PartnerRequestItemDto.prototype, "problem", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Flat 402, Sunshine Heights, Sector 14, New Delhi' }),
    __metadata("design:type", String)
], PartnerRequestItemDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 28.6139 }),
    __metadata("design:type", Object)
], PartnerRequestItemDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 77.2090 }),
    __metadata("design:type", Object)
], PartnerRequestItemDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2.4, description: 'Distance in kilometers from partner to customer' }),
    __metadata("design:type", Number)
], PartnerRequestItemDto.prototype, "distanceKm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-15T10:00:00.000Z' }),
    __metadata("design:type", String)
], PartnerRequestItemDto.prototype, "scheduledDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10:00 AM - 12:00 PM' }),
    __metadata("design:type", String)
], PartnerRequestItemDto.prototype, "timeSlot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 199.0 }),
    __metadata("design:type", Number)
], PartnerRequestItemDto.prototype, "visitingCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 300, description: 'Remaining seconds before request times out' }),
    __metadata("design:type", Number)
], PartnerRequestItemDto.prototype, "timeoutSecondsRemaining", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-14T09:30:00.000Z' }),
    __metadata("design:type", String)
], PartnerRequestItemDto.prototype, "createdAt", void 0);
//# sourceMappingURL=partner-request-response.dto.js.map