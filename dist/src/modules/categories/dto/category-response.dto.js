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
exports.ProblemDetailResponseDto = exports.CategoryResponseDto = exports.ProblemTypeResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ProblemTypeResponseDto {
    id;
    categoryId;
    title;
    description;
    estimatedPriceMin;
    estimatedPriceMax;
    isActive;
    createdAt;
    updatedAt;
}
exports.ProblemTypeResponseDto = ProblemTypeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", String)
], ProblemTypeResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", String)
], ProblemTypeResponseDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AC not cooling' }),
    __metadata("design:type", String)
], ProblemTypeResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Air conditioner is running but not blowing cold air.' }),
    __metadata("design:type", Object)
], ProblemTypeResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 299.0 }),
    __metadata("design:type", Object)
], ProblemTypeResponseDto.prototype, "estimatedPriceMin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 799.0 }),
    __metadata("design:type", Object)
], ProblemTypeResponseDto.prototype, "estimatedPriceMax", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ProblemTypeResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ProblemTypeResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ProblemTypeResponseDto.prototype, "updatedAt", void 0);
class CategoryResponseDto {
    id;
    name;
    slug;
    icon;
    filter;
    description;
    isActive;
    problemCount;
    problemTypes;
    createdAt;
    updatedAt;
}
exports.CategoryResponseDto = CategoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AC Repair' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ac-repair' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://assets.firstchoose.com/icons/ac-repair.svg' }),
    __metadata("design:type", Object)
], CategoryResponseDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'appliances', description: 'Domain / sector filter category key' }),
    __metadata("design:type", Object)
], CategoryResponseDto.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Comprehensive AC servicing, cooling diagnosis, gas refill and installation' }),
    __metadata("design:type", Object)
], CategoryResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], CategoryResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5 }),
    __metadata("design:type", Number)
], CategoryResponseDto.prototype, "problemCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [ProblemTypeResponseDto] }),
    __metadata("design:type", Array)
], CategoryResponseDto.prototype, "problemTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], CategoryResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], CategoryResponseDto.prototype, "updatedAt", void 0);
class ProblemDetailResponseDto extends ProblemTypeResponseDto {
    category;
}
exports.ProblemDetailResponseDto = ProblemDetailResponseDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CategoryResponseDto }),
    __metadata("design:type", CategoryResponseDto)
], ProblemDetailResponseDto.prototype, "category", void 0);
//# sourceMappingURL=category-response.dto.js.map