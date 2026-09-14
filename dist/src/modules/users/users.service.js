"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = UsersService_1 = class UsersService {
    prisma;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updateProfile(userId, dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException('User not found');
        }
        if (dto.email && dto.email !== existingUser.email) {
            const emailInUse = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (emailInUse) {
                throw new common_1.ConflictException('Email address is already in use');
            }
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(dto.name !== undefined ? { name: dto.name } : {}),
                ...(dto.email !== undefined ? { email: dto.email } : {}),
                ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
            },
            include: { professional: true },
        });
        this.logger.log(`[Users] Updated profile for user ${userId}`);
        return {
            id: updatedUser.id,
            phone: updatedUser.phone,
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role,
            status: updatedUser.status,
            avatarUrl: updatedUser.avatarUrl,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
            professional: updatedUser.professional
                ? {
                    id: updatedUser.professional.id,
                    businessName: updatedUser.professional.businessName,
                    isOnline: updatedUser.professional.isOnline,
                    isVerified: updatedUser.professional.isVerified,
                    kycStatus: updatedUser.professional.kycStatus,
                    rating: Number(updatedUser.professional.rating),
                    experienceYears: updatedUser.professional.experienceYears,
                    visitingCharge: Number(updatedUser.professional.visitingCharge),
                }
                : null,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map