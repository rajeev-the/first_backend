import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  CategoryResponseDto,
  ProblemDetailResponseDto,
  ProblemTypeResponseDto,
} from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProblemTypeDto } from './dto/create-problem-type.dto';
import { ServiceCategory, ProblemType, Prisma } from '@prisma/client';

import { ALL_50_CATEGORIES } from './catalog.data';

export interface SeedCatalogResult {
  categoriesCreated: number;
  problemsCreated: number;
  message: string;
}

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  private readonly cacheKeyAll = 'cache:categories:all';
  private readonly cacheTtlSeconds = 300; // 5 minutes cache for catalog

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
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

  async createProblemType(
    categoryIdOrSlug: string,
    dto: CreateProblemTypeDto,
  ): Promise<ProblemTypeResponseDto> {
    const category = await this.findByIdOrSlug(categoryIdOrSlug);

    const problem = await this.prisma.problemType.create({
      data: {
        categoryId: category.id,
        title: dto.title,
        description: dto.description ?? null,
        estimatedPriceMin: dto.estimatedPriceMin
          ? new Prisma.Decimal(dto.estimatedPriceMin)
          : null,
        estimatedPriceMax: dto.estimatedPriceMax
          ? new Prisma.Decimal(dto.estimatedPriceMax)
          : null,
        isActive: true,
      },
    });

    await this.redis.del(this.cacheKeyAll);
    this.logger.log(
      `[Problems] Created problem "${problem.title}" under category "${category.name}"`,
    );

    return this.formatProblem(problem);
  }

  async findAll(filter?: string): Promise<CategoryResponseDto[]> {
    const normalizedFilter = filter ? filter.toLowerCase().trim() : undefined;
    const cacheKey = normalizedFilter
      ? `${this.cacheKeyAll}:${normalizedFilter}`
      : this.cacheKeyAll;

    // Check Redis cache first
    const cached = await this.redis.get<CategoryResponseDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const whereClause: Prisma.ServiceCategoryWhereInput = {
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

    const result: CategoryResponseDto[] = categories.map((cat) => ({
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

    // Cache in Redis
    await this.redis.set(cacheKey, result, this.cacheTtlSeconds);

    return result;
  }

  async findByIdOrSlug(idOrSlug: string): Promise<CategoryResponseDto> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      idOrSlug,
    );

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
      throw new NotFoundException(`Service category "${idOrSlug}" not found`);
    }

    return this.formatCategory(category, category.problemTypes);
  }

  async findProblemsByCategoryId(idOrSlug: string): Promise<ProblemTypeResponseDto[]> {
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

  async findProblemById(problemId: string): Promise<ProblemDetailResponseDto> {
    const problem = await this.prisma.problemType.findUnique({
      where: { id: problemId },
      include: { category: true },
    });

    if (!problem || !problem.isActive) {
      throw new NotFoundException(`Problem type with ID "${problemId}" not found`);
    }

    return {
      ...this.formatProblem(problem),
      category: problem.category ? this.formatCategory(problem.category) : undefined,
    };
  }

  async seedCatalog(): Promise<SeedCatalogResult> {
    this.logger.log(`Starting catalog seeding with ${ALL_50_CATEGORIES.length} categories...`);

    let categoriesCreated = 0;
    let problemsCreated = 0;

    for (const catData of ALL_50_CATEGORIES) {
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
              estimatedPriceMin: new Prisma.Decimal(p.minPrice),
              estimatedPriceMax: new Prisma.Decimal(p.maxPrice),
              isActive: true,
            },
          });
          problemsCreated++;
        }
      }
    }

    // Invalidate Redis cache
    await this.redis.del(this.cacheKeyAll);

    this.logger.log(`Catalog seeded: ${categoriesCreated} categories, ${problemsCreated} problem types.`);

    return {
      categoriesCreated,
      problemsCreated,
      message: 'Service categories and problem types catalog seeded successfully',
    };
  }

  private formatCategory(
    cat: ServiceCategory,
    problemTypes?: ProblemType[],
  ): CategoryResponseDto {
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

  private formatProblem(p: ProblemType): ProblemTypeResponseDto {
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
}
