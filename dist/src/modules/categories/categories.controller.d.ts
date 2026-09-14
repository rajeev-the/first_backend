import { CategoriesService, SeedCatalogResult } from './categories.service';
import { CategoryResponseDto, ProblemTypeResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProblemTypeDto } from './dto/create-problem-type.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto>;
    createProblem(id: string, dto: CreateProblemTypeDto): Promise<ProblemTypeResponseDto>;
    findAll(filter?: string): Promise<CategoryResponseDto[]>;
    findOne(id: string): Promise<CategoryResponseDto>;
    findProblems(id: string): Promise<ProblemTypeResponseDto[]>;
    seed(): Promise<SeedCatalogResult>;
}
