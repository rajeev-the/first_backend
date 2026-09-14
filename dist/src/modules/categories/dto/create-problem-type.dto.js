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
exports.CreateProblemTypeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateProblemTypeDto {
    title;
    description;
    estimatedPriceMin;
    estimatedPriceMax;
}
exports.CreateProblemTypeDto = CreateProblemTypeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Problem title',
        example: 'Cockroach Infestation Treatment',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Problem title is required' }),
    (0, class_validator_1.MaxLength)(150, { message: 'Title cannot exceed 150 characters' }),
    __metadata("design:type", String)
], CreateProblemTypeDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Problem description or diagnostic guidance',
        example: 'Kitchen and bathroom gel baiting and spray treatment.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateProblemTypeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Estimated minimum price in INR (₹)',
        example: 499.0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Estimated min price must be a valid number' }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateProblemTypeDto.prototype, "estimatedPriceMin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Estimated maximum price in INR (₹)',
        example: 1299.0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Estimated max price must be a valid number' }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateProblemTypeDto.prototype, "estimatedPriceMax", void 0);
//# sourceMappingURL=create-problem-type.dto.js.map