export declare class PartnerRequestCustomerDto {
    id: string;
    name: string;
    phone: string;
    avatarUrl?: string | null;
}
export declare class PartnerRequestCategoryDto {
    id: string;
    name: string;
    iconUrl?: string | null;
}
export declare class PartnerRequestProblemDto {
    id?: string | null;
    title: string;
    description?: string | null;
}
export declare class PartnerRequestItemDto {
    id: string;
    bookingNumber: string;
    status: string;
    customer: PartnerRequestCustomerDto;
    category: PartnerRequestCategoryDto;
    problem: PartnerRequestProblemDto;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
    distanceKm: number;
    scheduledDate: string;
    timeSlot: string;
    visitingCharge: number;
    timeoutSecondsRemaining: number;
    createdAt: string;
}
