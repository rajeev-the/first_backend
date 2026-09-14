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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProblemsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const categories_service_1 = require("./categories.service");
const category_response_dto_1 = require("./dto/category-response.dto");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let ProblemsController = class ProblemsController {
    categoriesService;
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    async findOne(id) {
        return this.categoriesService.findProblemById(id);
    }
};
exports.ProblemsController = ProblemsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🌐 [PUBLIC] Get problem type by ID',
        description: '🌐 **Access:** Public\n\nRetrieves problem type details including parent category context and estimated price range.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Problem Type UUID',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Problem type details',
        type: category_response_dto_1.ProblemDetailResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Problem type not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProblemsController.prototype, "findOne", null);
exports.ProblemsController = ProblemsController = __decorate([
    (0, swagger_1.ApiTags)('Problems'),
    (0, common_1.Controller)('problems'),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService])
], ProblemsController);
//# sourceMappingURL=problems.controller.js.map