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
exports.UpdateBookingStatusDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const booking_state_machine_1 = require("../booking-state-machine");
class UpdateBookingStatusDto {
    status;
    note;
    notes;
    reason;
}
exports.UpdateBookingStatusDto = UpdateBookingStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.BookingStatus,
        description: 'Target booking status transition (supports aliases like REQUESTED, WAITING_CUSTOMER_APPROVAL, APPROVED, REJECTED)',
        example: client_1.BookingStatus.ACCEPTED,
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'status is required' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return typeof value === 'string' ? (0, booking_state_machine_1.normalizeBookingStatus)(value) : value;
        }
        catch {
            return value;
        }
    }),
    (0, class_validator_1.IsEnum)(client_1.BookingStatus, { message: 'Invalid booking status' }),
    __metadata("design:type", String)
], UpdateBookingStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional transition remarks or note',
        example: 'Started journey to customer location',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateBookingStatusDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional transition remarks or notes',
        example: 'Started journey to customer location',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateBookingStatusDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional reason for decline/transition',
        example: 'Unavailable at this time',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateBookingStatusDto.prototype, "reason", void 0);
//# sourceMappingURL=update-booking-status.dto.js.map