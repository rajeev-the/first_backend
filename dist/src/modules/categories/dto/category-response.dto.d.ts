export declare class ProblemTypeResponseDto {
    id: string;
    categoryId: string;
    title: string;
    description?: string | null;
    estimatedPriceMin?: number | null;
    estimatedPriceMax?: number | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CategoryResponseDto {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    filter?: string | null;
    description?: string | null;
    isActive: boolean;
    problemCount?: number;
    problemTypes?: ProblemTypeResponseDto[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class ProblemDetailResponseDto extends ProblemTypeResponseDto {
    category?: CategoryResponseDto;
}
