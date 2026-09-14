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
exports.BookingPriceCalculationResultDto = exports.CalculateBookingPriceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CalculateBookingPriceDto {
    professionalId;
    categoryId;
    couponCode;
}
exports.CalculateBookingPriceDto = CalculateBookingPriceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'UUID of the professional to visit',
        example: 'd9b2d63d-a233-4123-8478-94420e6f66aa',
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'professionalId is required' }),
    (0, class_validator_1.IsUUID)('4', { message: 'professionalId must be a valid UUID' }),
    __metadata("design:type", String)
], CalculateBookingPriceDto.prototype, "professionalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'UUID of the service category',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'categoryId is required' }),
    (0, class_validator_1.IsUUID)('4', { message: 'categoryId must be a valid UUID' }),
    __metadata("design:type", String)
], CalculateBookingPriceDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional promotional coupon code',
        example: 'FIRST50',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalculateBookingPriceDto.prototype, "couponCode", void 0);
class BookingPriceCalculationResultDto {
    visitingCharge;
    taxAmount;
    platformFee;
    discountAmount;
    totalAmount;
    currency;
}
exports.BookingPriceCalculationResultDto = BookingPriceCalculationResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 199.0, description: 'Base visiting charge set by the professional' }),
    __metadata("design:type", Number)
], BookingPriceCalculationResultDto.prototype, "visitingCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 35.82, description: 'GST / Government taxes (18%)' }),
    __metadata("design:type", Number)
], BookingPriceCalculationResultDto.prototype, "taxAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 19.0, description: 'Standard platform convenience fee' }),
    __metadata("design:type", Number)
], BookingPriceCalculationResultDto.prototype, "platformFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0.0, description: 'Discount applied from coupon' }),
    __metadata("design:type", Number)
], BookingPriceCalculationResultDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 253.82, description: 'Final payable amount for booking visit' }),
    __metadata("design:type", Number)
], BookingPriceCalculationResultDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'INR', description: 'Currency' }),
    __metadata("design:type", String)
], BookingPriceCalculationResultDto.prototype, "currency", void 0);
//# sourceMappingURL=calculate-booking.dto.js.map