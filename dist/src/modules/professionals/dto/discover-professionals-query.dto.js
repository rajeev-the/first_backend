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
exports.DiscoverProfessionalsQueryDto = exports.ProfessionalSortBy = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var ProfessionalSortBy;
(function (ProfessionalSortBy) {
    ProfessionalSortBy["RECOMMENDED"] = "recommended";
    ProfessionalSortBy["DISTANCE"] = "distance";
    ProfessionalSortBy["RATING"] = "rating";
    ProfessionalSortBy["EXPERIENCE"] = "experience";
    ProfessionalSortBy["PRICE_LOW_TO_HIGH"] = "price_low_to_high";
})(ProfessionalSortBy || (exports.ProfessionalSortBy = ProfessionalSortBy = {}));
class DiscoverProfessionalsQueryDto {
    lat;
    lng;
    radius = 10;
    category;
    rating;
    availability;
    sortBy = ProfessionalSortBy.RECOMMENDED;
    page = 1;
    limit = 20;
}
exports.DiscoverProfessionalsQueryDto = DiscoverProfessionalsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer current latitude coordinate',
        example: 28.6139,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'lat must be a valid number' }),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], DiscoverProfessionalsQueryDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer current longitude coordinate',
        example: 77.209,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'lng must be a valid number' }),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], DiscoverProfessionalsQueryDto.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Search radius in kilometers',
        example: 10,
        default: 10,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'radius must be a valid number' }),
    (0, class_validator_1.Min)(0.1, { message: 'radius must be at least 0.1 km' }),
    (0, class_validator_1.Max)(100, { message: 'radius cannot exceed 100 km' }),
    __metadata("design:type", Number)
], DiscoverProfessionalsQueryDto.prototype, "radius", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by category slug (e.g. "ac-repair") or category UUID',
        example: 'ac-repair',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DiscoverProfessionalsQueryDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Minimum rating threshold (0.0 - 5.0)',
        example: 4.5,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'rating must be a valid number' }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], DiscoverProfessionalsQueryDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by online/live availability (true for only active/online)',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true' || value === true || value === 1 || value === '1')
            return true;
        if (value === 'false' || value === false || value === 0 || value === '0')
            return false;
        return value;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DiscoverProfessionalsQueryDto.prototype, "availability", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sorting criteria',
        enum: ProfessionalSortBy,
        default: ProfessionalSortBy.RECOMMENDED,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ProfessionalSortBy),
    __metadata("design:type", String)
], DiscoverProfessionalsQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page number for pagination',
        default: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], DiscoverProfessionalsQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of items per page',
        default: 20,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], DiscoverProfessionalsQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=discover-professionals-query.dto.js.map