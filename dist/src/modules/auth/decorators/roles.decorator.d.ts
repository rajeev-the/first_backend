import { CustomDecorator } from '@nestjs/common';
import { UserRole } from '@prisma/client';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: UserRole[]) => CustomDecorator<string>;
