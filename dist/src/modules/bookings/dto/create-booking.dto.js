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
exports.CreateBookingDto = exports.BookingAddressDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class BookingAddressDto {
    addressLine1;
    addressLine2;
    city;
    state;
    pincode;
    landmark;
}
exports.BookingAddressDto = BookingAddressDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Flat 402, Sunshine Heights, Main Road',
        description: 'Street address / house number',
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'addressLine1 is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], BookingAddressDto.prototype, "addressLine1", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Near Metro Station Gate 2',
        description: 'Secondary address or area',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], BookingAddressDto.prototype, "addressLine2", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'New Delhi', description: 'City name' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'city is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], BookingAddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Delhi', description: 'State name' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'state is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], BookingAddressDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '110001', description: 'Postal PIN code' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'pincode is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], BookingAddressDto.prototype, "pincode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Opposite City Mall', description: 'Nearby landmark' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], BookingAddressDto.prototype, "landmark", void 0);
class CreateBookingDto {
    professionalId;
    categoryId;
    problemId;
    problemDescription;
    address;
    latitude;
    longitude;
    scheduledDate;
    timeSlot;
    paymentMethod;
}
exports.CreateBookingDto = CreateBookingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'UUID of the professional being booked',
        example: 'd9b2d63d-a233-4123-8478-94420e6f66aa',
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'professionalId is required' }),
    (0, class_validator_1.IsUUID)('4', { message: 'professionalId must be a valid UUID' }),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "professionalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'UUID of the service category',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'categoryId is required' }),
    (0, class_validator_1.IsUUID)('4', { message: 'categoryId must be a valid UUID' }),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'UUID of specific problem type (optional)',
        example: '8fb2d63d-a233-4123-8478-94420e6f66aa',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'problemId must be a valid UUID' }),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "problemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Detailed description of the issue or requirement',
        example: 'AC is making a loud buzzing noise and not cooling properly in the master bedroom.',
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'problemDescription is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1500),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "problemDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer service address details',
        type: BookingAddressDto,
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'address is required' }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => BookingAddressDto),
    __metadata("design:type", BookingAddressDto)
], CreateBookingDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 28.6139, description: 'Latitude of customer visit location' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], CreateBookingDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 77.209, description: 'Longitude of customer visit location' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], CreateBookingDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-08-25T10:00:00.000Z',
        description: 'Scheduled visit date and time',
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'scheduledDate is required' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "scheduledDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '10:00 AM - 12:00 PM',
        description: 'Preferred time window for professional arrival',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "timeSlot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.PaymentMethod,
        example: client_1.PaymentMethod.UPI,
        description: 'Chosen payment method for visiting charge',
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'paymentMethod is required' }),
    (0, class_validator_1.IsEnum)(client_1.PaymentMethod, { message: 'Invalid payment method' }),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "paymentMethod", void 0);
//# sourceMappingURL=create-booking.dto.js.map