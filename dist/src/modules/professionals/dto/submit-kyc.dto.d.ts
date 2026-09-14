import { KycDocumentType } from '@prisma/client';
export declare class SubmitKycDto {
    documentType: KycDocumentType;
    documentNumber: string;
    documentUrl: string;
}
