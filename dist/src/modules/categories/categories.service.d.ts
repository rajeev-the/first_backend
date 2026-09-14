import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CategoryResponseDto, ProblemDetailResponseDto, ProblemTypeResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProblemTypeDto } from './dto/create-problem-type.dto';
export interface SeedCatalogResult {
    categoriesCreated: number;
    problemsCreated: number;
    message: string;
}
export declare class CategoriesService {
    private readonly prisma;
    private readonly redis;
    private readonly logger;
    private readonly cacheKeyAll;
    private readonly cacheTtlSeconds;
    constructor(prisma: PrismaService, redis: RedisService);
    createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto>;
    createProblemType(categoryIdOrSlug: string, dto: CreateProblemTypeDto): Promise<ProblemTypeResponseDto>;
    findAll(filter?: string): Promise<CategoryResponseDto[]>;
    findByIdOrSlug(idOrSlug: string): Promise<CategoryResponseDto>;
    findProblemsByCategoryId(idOrSlug: string): Promise<ProblemTypeResponseDto[]>;
    findProblemById(problemId: string): Promise<ProblemDetailResponseDto>;
    seedCatalog(): Promise<SeedCatalogResult>;
    private formatCategory;
    private formatProblem;
}
