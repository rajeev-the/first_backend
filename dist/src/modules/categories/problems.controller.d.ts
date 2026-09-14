import { CategoriesService } from './categories.service';
import { ProblemDetailResponseDto } from './dto/category-response.dto';
export declare class ProblemsController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findOne(id: string): Promise<ProblemDetailResponseDto>;
}
