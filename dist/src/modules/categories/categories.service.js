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
var CategoriesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const client_1 = require("@prisma/client");
const catalog_data_1 = require("./catalog.data");
let CategoriesService = CategoriesService_1 = class CategoriesService {
    prisma;
    redis;
    logger = new common_1.Logger(CategoriesService_1.name);
    cacheKeyAll = 'cache:categories:all';
    cacheTtlSeconds = 300;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async createCategory(dto) {
        const slug = dto.slug
            ? dto.slug.toLowerCase().trim()
            : dto.name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        const category = await this.prisma.serviceCategory.create({
            data: {
                name: dto.name,
                slug,
                icon: dto.icon ?? null,
                filter: dto.filter ? dto.filter.toLowerCase().trim() : null,
                description: dto.description ?? null,
                isActive: true,
            },
        });
        await this.redis.del(this.cacheKeyAll);
        this.logger.log(`[Categories] Created category "${category.name}" (${category.id})`);
        return this.formatCategory(category);
    }
    async createProblemType(categoryIdOrSlug, dto) {
        const category = await this.findByIdOrSlug(categoryIdOrSlug);
        const problem = await this.prisma.problemType.create({
            data: {
                categoryId: category.id,
                title: dto.title,
                description: dto.description ?? null,
                estimatedPriceMin: dto.estimatedPriceMin
                    ? new client_1.Prisma.Decimal(dto.estimatedPriceMin)
                    : null,
                estimatedPriceMax: dto.estimatedPriceMax
                    ? new client_1.Prisma.Decimal(dto.estimatedPriceMax)
                    : null,
                isActive: true,
            },
        });
        await this.redis.del(this.cacheKeyAll);
        this.logger.log(`[Problems] Created problem "${problem.title}" under category "${category.name}"`);
        return this.formatProblem(problem);
    }
    async findAll(filter) {
        const normalizedFilter = filter ? filter.toLowerCase().trim() : undefined;
        const cacheKey = normalizedFilter
            ? `${this.cacheKeyAll}:${normalizedFilter}`
            : this.cacheKeyAll;
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return cached;
        }
        const whereClause = {
            isActive: true,
            ...(normalizedFilter && normalizedFilter !== 'all'
                ? { filter: normalizedFilter }
                : {}),
        };
        const categories = await this.prisma.serviceCategory.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: { problemTypes: { where: { isActive: true } } },
                },
            },
            orderBy: { name: 'asc' },
        });
        const result = categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            filter: cat.filter,
            description: cat.description,
            isActive: cat.isActive,
            problemCount: cat._count.problemTypes,
            createdAt: cat.createdAt,
            updatedAt: cat.updatedAt,
        }));
        await this.redis.set(cacheKey, result, this.cacheTtlSeconds);
        return result;
    }
    async findByIdOrSlug(idOrSlug) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
        const category = await this.prisma.serviceCategory.findFirst({
            where: isUuid
                ? { id: idOrSlug, isActive: true }
                : { slug: idOrSlug.toLowerCase(), isActive: true },
            include: {
                problemTypes: {
                    where: { isActive: true },
                    orderBy: { title: 'asc' },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Service category "${idOrSlug}" not found`);
        }
        return this.formatCategory(category, category.problemTypes);
    }
    async findProblemsByCategoryId(idOrSlug) {
        const category = await this.findByIdOrSlug(idOrSlug);
        const problems = await this.prisma.problemType.findMany({
            where: {
                categoryId: category.id,
                isActive: true,
            },
            orderBy: { title: 'asc' },
        });
        return problems.map((p) => this.formatProblem(p));
    }
    async findProblemById(problemId) {
        const problem = await this.prisma.problemType.findUnique({
            where: { id: problemId },
            include: { category: true },
        });
        if (!problem || !problem.isActive) {
            throw new common_1.NotFoundException(`Problem type with ID "${problemId}" not found`);
        }
        return {
            ...this.formatProblem(problem),
            category: problem.category ? this.formatCategory(problem.category) : undefined,
        };
    }
    async seedCatalog() {
        this.logger.log(`Starting catalog seeding with ${catalog_data_1.ALL_50_CATEGORIES.length} categories...`);
        let categoriesCreated = 0;
        let problemsCreated = 0;
        for (const catData of catalog_data_1.ALL_50_CATEGORIES) {
            const category = await this.prisma.serviceCategory.upsert({
                where: { slug: catData.slug },
                update: {
                    name: catData.name,
                    icon: catData.icon,
                    filter: catData.filter,
                    description: catData.description,
                    isActive: true,
                },
                create: {
                    name: catData.name,
                    slug: catData.slug,
                    icon: catData.icon,
                    filter: catData.filter,
                    description: catData.description,
                    isActive: true,
                },
            });
            categoriesCreated++;
            for (const p of catData.problems) {
                const existingProblem = await this.prisma.problemType.findFirst({
                    where: {
                        categoryId: category.id,
                        title: p.title,
                    },
                });
                if (!existingProblem) {
                    await this.prisma.problemType.create({
                        data: {
                            categoryId: category.id,
                            title: p.title,
                            description: p.description,
                            estimatedPriceMin: new client_1.Prisma.Decimal(p.minPrice),
                            estimatedPriceMax: new client_1.Prisma.Decimal(p.maxPrice),
                            isActive: true,
                        },
                    });
                    problemsCreated++;
                }
            }
        }
        await this.redis.del(this.cacheKeyAll);
        this.logger.log(`Catalog seeded: ${categoriesCreated} categories, ${problemsCreated} problem types.`);
        return {
            categoriesCreated,
            problemsCreated,
            message: 'Service categories and problem types catalog seeded successfully',
        };
    }
    formatCategory(cat, problemTypes) {
        return {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            filter: cat.filter,
            description: cat.description,
            isActive: cat.isActive,
            problemCount: problemTypes ? problemTypes.length : undefined,
            problemTypes: problemTypes ? problemTypes.map((p) => this.formatProblem(p)) : undefined,
            createdAt: cat.createdAt,
            updatedAt: cat.updatedAt,
        };
    }
    formatProblem(p) {
        return {
            id: p.id,
            categoryId: p.categoryId,
            title: p.title,
            description: p.description,
            estimatedPriceMin: p.estimatedPriceMin ? Number(p.estimatedPriceMin) : null,
            estimatedPriceMax: p.estimatedPriceMax ? Number(p.estimatedPriceMax) : null,
            isActive: p.isActive,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = CategoriesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map