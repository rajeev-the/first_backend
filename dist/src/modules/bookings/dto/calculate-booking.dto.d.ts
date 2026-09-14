export declare class CalculateBookingPriceDto {
    professionalId: string;
    categoryId: string;
    couponCode?: string;
}
export declare class BookingPriceCalculationResultDto {
    visitingCharge: number;
    taxAmount: number;
    platformFee: number;
    discountAmount: number;
    totalAmount: number;
    currency: string;
}
