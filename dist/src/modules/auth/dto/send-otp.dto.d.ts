import { UserRole } from '@prisma/client';
export declare class SendOtpDto {
    phone: string;
    role?: UserRole;
}
