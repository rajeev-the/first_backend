import { KycDocumentType, KycStatus, UserRole, UserStatus } from '@prisma/client';
export declare class KycDocumentResponseDto {
    id: string;
    documentType: KycDocumentType;
    documentNumber: string;
    documentUrl: string;
    status: KycStatus;
    rejectionReason?: string | null;
    verifiedAt?: Date | null;
    createdAt: Date;
}
export declare class ProfessionalServiceItemDto {
    id: string;
    categoryId: string;
    categoryName: string;
    categorySlug: string;
    categoryIcon?: string | null;
    customRate?: number | null;
    isActive: boolean;
    createdAt: Date;
}
export declare class ProfessionalReviewDto {
    id: string;
    rating: number;
    comment?: string | null;
    customerName: string;
    customerAvatar?: string | null;
    createdAt: Date;
}
export declare class ProfessionalProfileDetailDto {
    id: string;
    userId: string;
    name?: string;
    businessName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    experienceYears: number;
    experience: number;
    visitingCharge: number;
    isOnline: boolean;
    isAvailable: boolean;
    isVerified: boolean;
    kycStatus: KycStatus;
    rating: number;
    totalReviews: number;
    serviceRadiusKm: number;
    distance?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    portfolio?: any;
    createdAt: Date;
    updatedAt: Date;
    user?: {
        id: string;
        phone: string;
        email: string | null;
        name: string | null;
        role: UserRole;
        status: UserStatus;
        avatarUrl: string | null;
    };
    services?: ProfessionalServiceItemDto[];
    reviews?: ProfessionalReviewDto[];
    kycDocuments?: KycDocumentResponseDto[];
}
