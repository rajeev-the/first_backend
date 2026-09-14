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
exports.BookingResponseDto = exports.BookingQuoteResponseDto = exports.QuoteItemResponseDto = exports.BookingPaymentItemDto = exports.BookingStatusHistoryItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class BookingStatusHistoryItemDto {
    id;
    status;
    changedById;
    notes;
    createdAt;
}
exports.BookingStatusHistoryItemDto = BookingStatusHistoryItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", String)
], BookingStatusHistoryItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.BookingStatus, example: client_1.BookingStatus.ACCEPTED }),
    __metadata("design:type", String)
], BookingStatusHistoryItemDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", Object)
], BookingStatusHistoryItemDto.prototype, "changedById", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Professional accepted the visit request' }),
    __metadata("design:type", Object)
], BookingStatusHistoryItemDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], BookingStatusHistoryItemDto.prototype, "createdAt", void 0);
class BookingPaymentItemDto {
    id;
    paymentType;
    method;
    status;
    amount;
    currency;
    transactionId;
    createdAt;
}
exports.BookingPaymentItemDto = BookingPaymentItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", String)
], BookingPaymentItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PaymentType, example: client_1.PaymentType.VISITING_CHARGE }),
    __metadata("design:type", String)
], BookingPaymentItemDto.prototype, "paymentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PaymentMethod, example: client_1.PaymentMethod.UPI }),
    __metadata("design:type", String)
], BookingPaymentItemDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PaymentStatus, example: client_1.PaymentStatus.PENDING }),
    __metadata("design:type", String)
], BookingPaymentItemDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 199.0 }),
    __metadata("design:type", Number)
], BookingPaymentItemDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'INR' }),
    __metadata("design:type", String)
], BookingPaymentItemDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'TXN-9876543210' }),
    __metadata("design:type", Object)
], BookingPaymentItemDto.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], BookingPaymentItemDto.prototype, "createdAt", void 0);
class QuoteItemResponseDto {
    id;
    description;
    itemType;
    quantity;
    unitPrice;
    totalPrice;
}
exports.QuoteItemResponseDto = QuoteItemResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", String)
], QuoteItemResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Compressor Capacitor Replacement' }),
    __metadata("design:type", String)
], QuoteItemResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.QuoteItemType, example: client_1.QuoteItemType.SPARE_PART }),
    __metadata("design:type", String)
], QuoteItemResponseDto.prototype, "itemType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1.0 }),
    __metadata("design:type", Number)
], QuoteItemResponseDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 850.0 }),
    __metadata("design:type", Number)
], QuoteItemResponseDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 850.0 }),
    __metadata("design:type", Number)
], QuoteItemResponseDto.prototype, "totalPrice", void 0);
class BookingQuoteResponseDto {
    id;
    quoteNumber;
    subtotal;
    tax;
    discount;
    totalAmount;
    status;
    customerNotes;
    items;
    createdAt;
}
exports.BookingQuoteResponseDto = BookingQuoteResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", String)
], BookingQuoteResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'QT-20260824-001' }),
    __metadata("design:type", String)
], BookingQuoteResponseDto.prototype, "quoteNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1200.0 }),
    __metadata("design:type", Number)
], BookingQuoteResponseDto.prototype, "subtotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 216.0 }),
    __metadata("design:type", Number)
], BookingQuoteResponseDto.prototype, "tax", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0.0 }),
    __metadata("design:type", Number)
], BookingQuoteResponseDto.prototype, "discount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1416.0 }),
    __metadata("design:type", Number)
], BookingQuoteResponseDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.QuoteStatus, example: client_1.QuoteStatus.PENDING_APPROVAL }),
    __metadata("design:type", String)
], BookingQuoteResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Labor warranty included for 90 days' }),
    __metadata("design:type", Object)
], BookingQuoteResponseDto.prototype, "customerNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [QuoteItemResponseDto] }),
    __metadata("design:type", Array)
], BookingQuoteResponseDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], BookingQuoteResponseDto.prototype, "createdAt", void 0);
class BookingResponseDto {
    id;
    bookingNumber;
    customerId;
    professionalId;
    categoryId;
    problemId;
    problemDescription;
    address;
    latitude;
    longitude;
    scheduledDate;
    visitingCharge;
    status;
    createdAt;
    updatedAt;
    professional;
    customer;
    category;
    problem;
    payments;
    quotes;
    statusHistory;
}
exports.BookingResponseDto = BookingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'BK-20260824-A1B2' }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "bookingNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", Object)
], BookingResponseDto.prototype, "professionalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", Object)
], BookingResponseDto.prototype, "problemId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'AC cooling coil issue and loud rattling noise' }),
    __metadata("design:type", Object)
], BookingResponseDto.prototype, "problemDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            addressLine1: 'Flat 402, Sunshine Heights',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110001',
        },
    }),
    __metadata("design:type", Object)
], BookingResponseDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 28.6139 }),
    __metadata("design:type", Object)
], BookingResponseDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 77.209 }),
    __metadata("design:type", Object)
], BookingResponseDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-25T10:00:00.000Z' }),
    __metadata("design:type", Date)
], BookingResponseDto.prototype, "scheduledDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 199.0 }),
    __metadata("design:type", Number)
], BookingResponseDto.prototype, "visitingCharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.BookingStatus, example: client_1.BookingStatus.PENDING }),
    __metadata("design:type", String)
], BookingResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], BookingResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], BookingResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BookingResponseDto.prototype, "professional", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BookingResponseDto.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BookingResponseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], BookingResponseDto.prototype, "problem", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [BookingPaymentItemDto] }),
    __metadata("design:type", Array)
], BookingResponseDto.prototype, "payments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [BookingQuoteResponseDto] }),
    __metadata("design:type", Array)
], BookingResponseDto.prototype, "quotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [BookingStatusHistoryItemDto] }),
    __metadata("design:type", Array)
], BookingResponseDto.prototype, "statusHistory", void 0);
//# sourceMappingURL=booking-response.dto.js.map