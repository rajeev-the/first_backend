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
exports.SubmitKycDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class SubmitKycDto {
    documentType;
    documentNumber;
    documentUrl;
}
exports.SubmitKycDto = SubmitKycDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of identity or verification document',
        enum: client_1.KycDocumentType,
        example: client_1.KycDocumentType.AADHAAR,
    }),
    (0, class_validator_1.IsEnum)(client_1.KycDocumentType, {
        message: 'Document type must be one of: AADHAAR, PAN, DRIVING_LICENSE, PASSPORT, TRADE_LICENSE, CERTIFICATION, PROFILE_PHOTO, OTHER',
    }),
    __metadata("design:type", String)
], SubmitKycDto.prototype, "documentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique document identifier number (e.g. Aadhaar/PAN number)',
        example: '1234-5678-9012',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Document number is required' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Document number cannot exceed 100 characters' }),
    __metadata("design:type", String)
], SubmitKycDto.prototype, "documentNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Public URL to the uploaded document image or PDF',
        example: 'https://storage.firstchoose.com/kyc/sharma_aadhaar.pdf',
    }),
    (0, class_validator_1.IsUrl)({}, { message: 'Document URL must be a valid URL' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Document URL is required' }),
    __metadata("design:type", String)
], SubmitKycDto.prototype, "documentUrl", void 0);
//# sourceMappingURL=submit-kyc.dto.js.map