import { UserRole } from '@prisma/client';
export declare class VerifyOtpDto {
    phone: string;
    otp: string;
    role?: UserRole;
}
