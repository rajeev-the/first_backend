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
exports.CategoriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const categories_service_1 = require("./categories.service");
const category_response_dto_1 = require("./dto/category-response.dto");
const create_category_dto_1 = require("./dto/create-category.dto");
const create_problem_type_dto_1 = require("./dto/create-problem-type.dto");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let CategoriesController = class CategoriesController {
    categoriesService;
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    async createCategory(dto) {
        return this.categoriesService.createCategory(dto);
    }
    async createProblem(id, dto) {
        return this.categoriesService.createProblemType(id, dto);
    }
    async findAll(filter) {
        return this.categoriesService.findAll(filter);
    }
    async findOne(id) {
        return this.categoriesService.findByIdOrSlug(id);
    }
    async findProblems(id) {
        return this.categoriesService.findProblemsByCategoryId(id);
    }
    async seed() {
        return this.categoriesService.seedCatalog();
    }
};
exports.CategoriesController = CategoriesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: '🔒 [ADMIN] Create a new service category',
        description: '🔒 **Access:** Admin / Catalog Manager\n\nCreates a custom service category (e.g. Pest Control, Salon at Home).',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Category created successfully',
        type: category_response_dto_1.CategoryResponseDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "createCategory", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(':id/problems'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: '🔒 [ADMIN] Create a problem type under a category',
        description: '🔒 **Access:** Admin / Catalog Manager\n\nAdds a new problem type with estimated price range under the specified category ID or slug.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Category UUID or URL slug',
        example: 'ac-repair',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Problem type created successfully',
        type: category_response_dto_1.ProblemTypeResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_problem_type_dto_1.CreateProblemTypeDto]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "createProblem", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🌐 [PUBLIC] List all service categories',
        description: '🌐 **Access:** Public\n\nReturns all active categories with problem type count for home/discovery catalog. Optional ?filter= query (e.g. repairs, appliances, cleaning, automotive, tech, interiors).',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'filter',
        required: false,
        description: 'Filter categories by sector/domain (repairs, appliances, cleaning, automotive, tech, interiors)',
        example: 'appliances',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of active categories',
        type: [category_response_dto_1.CategoryResponseDto],
    }),
    __param(0, (0, common_1.Query)('filter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🌐 [PUBLIC] Get category by ID or slug',
        description: '🌐 **Access:** Public\n\nRetrieves a single service category with its active problem types using UUID or slug (e.g. "ac-repair").',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Category UUID or URL slug (e.g. ac-repair, electrician)',
        example: 'ac-repair',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Category details with problem types',
        type: category_response_dto_1.CategoryResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Category not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "findOne", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id/problems'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '🌐 [PUBLIC] Get problems by category ID or slug',
        description: '🌐 **Access:** Public\n\nReturns all problem types belonging to the specified category ID or slug.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Category UUID or URL slug',
        example: 'ac-repair',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of problem types under the category',
        type: [category_response_dto_1.ProblemTypeResponseDto],
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Category not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "findProblems", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('seed'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: '⚡ [ADMIN / DEV] Seed initial catalog data',
        description: '⚡ **Access:** Admin / DevOps Setup\n\nSeeds the database with essential home service categories and problem types (AC, Electrician, Plumber, etc.).',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Catalog seeded successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "seed", null);
exports.CategoriesController = CategoriesController = __decorate([
    (0, swagger_1.ApiTags)('Categories'),
    (0, common_1.Controller)('categories'),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService])
], CategoriesController);
//# sourceMappingURL=categories.controller.js.map