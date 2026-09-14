export declare enum ProfessionalSortBy {
    RECOMMENDED = "recommended",
    DISTANCE = "distance",
    RATING = "rating",
    EXPERIENCE = "experience",
    PRICE_LOW_TO_HIGH = "price_low_to_high"
}
export declare class DiscoverProfessionalsQueryDto {
    lat: number;
    lng: number;
    radius?: number;
    category?: string;
    rating?: number;
    availability?: boolean;
    sortBy?: ProfessionalSortBy;
    page?: number;
    limit?: number;
}
