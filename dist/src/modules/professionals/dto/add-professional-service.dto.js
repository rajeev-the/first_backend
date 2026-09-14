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
exports.AddProfessionalServiceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class AddProfessionalServiceDto {
    categoryIds;
    customRate;
}
exports.AddProfessionalServiceDto = AddProfessionalServiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of Category UUIDs to link to the professional profile',
        example: ['3fa85f64-5717-4562-b3fc-2c963f66afa6'],
    }),
    (0, class_validator_1.IsArray)({ message: 'Category IDs must be an array' }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one Category ID must be provided' }),
    (0, class_validator_1.IsUUID)('4', { each: true, message: 'Each category ID must be a valid UUID' }),
    __metadata("design:type", Array)
], AddProfessionalServiceDto.prototype, "categoryIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional custom rate for these services in INR (₹)',
        example: 350.0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Custom rate must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Custom rate cannot be negative' }),
    __metadata("design:type", Number)
], AddProfessionalServiceDto.prototype, "customRate", void 0);
//# sourceMappingURL=add-professional-service.dto.js.map