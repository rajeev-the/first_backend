export interface CatalogProblemItem {
    title: string;
    description: string;
    minPrice: number;
    maxPrice: number;
}
export interface CatalogCategoryItem {
    name: string;
    slug: string;
    icon: string;
    filter: 'repairs' | 'appliances' | 'cleaning' | 'automotive' | 'tech' | 'interiors' | string;
    description: string;
    problems: CatalogProblemItem[];
}
export declare const ALL_50_CATEGORIES: CatalogCategoryItem[];
