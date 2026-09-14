"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const jwt_service_1 = require("./jwt.service");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    redis;
    jwtTokenService;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    isDev;
    otpTtlSeconds = 300;
    sessionTtlSeconds = 30 * 24 * 60 * 60;
    constructor(prisma, redis, jwtTokenService, configService) {
        this.prisma = prisma;
        this.redis = redis;
        this.jwtTokenService = jwtTokenService;
        this.configService = configService;
        this.isDev = this.configService.get('app.nodeEnv') !== 'production';
    }
    async sendOtp(dto) {
        const cleanedPhone = this.normalizePhone(dto.phone);
        const otpCode = this.isDev ? '1234' : Math.floor(1000 + Math.random() * 9000).toString();
        const otpKey = `otp:${cleanedPhone}`;
        await this.redis.set(otpKey, otpCode, this.otpTtlSeconds);
        this.logger.log(`[OTP] Generated OTP for ${cleanedPhone} (TTL: ${this.otpTtlSeconds}s)`);
        return {
            phone: cleanedPhone,
            expiresInSeconds: this.otpTtlSeconds,
            message: 'OTP sent successfully. Please verify to continue.',
            debugOtp: this.isDev ? otpCode : undefined,
        };
    }
    async verifyOtp(dto) {
        const cleanedPhone = this.normalizePhone(dto.phone);
        const otpKey = `otp:${cleanedPhone}`;
        const storedOtp = await this.redis.get(otpKey);
        const isMockValid = this.isDev && (dto.otp === '1234' || dto.otp === '123456');
        const isStoredValid = storedOtp && storedOtp.toString() === dto.otp.trim();
        if (!isStoredValid && !isMockValid) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        await this.redis.del(otpKey);
        let user = await this.prisma.user.findUnique({
            where: { phone: cleanedPhone },
            include: { professional: true },
        });
        let isNewUser = false;
        if (!user) {
            isNewUser = true;
            const role = dto.role || client_1.UserRole.CUSTOMER;
            user = await this.prisma.user.create({
                data: {
                    phone: cleanedPhone,
                    role,
                    status: client_1.UserStatus.ACTIVE,
                    ...(role === client_1.UserRole.PROFESSIONAL
                        ? {
                            professional: {
                                create: {
                                    businessName: null,
                                    isOnline: false,
                                    isVerified: false,
                                },
                            },
                        }
                        : {}),
                },
                include: { professional: true },
            });
            this.logger.log(`[Auth] Registered new user with ID: ${user.id} (Role: ${user.role})`);
        }
        else {
            if (user.status === client_1.UserStatus.SUSPENDED) {
                throw new common_1.ForbiddenException('Your account has been suspended. Please contact support.');
            }
            if (dto.role === client_1.UserRole.PROFESSIONAL && user.role !== client_1.UserRole.ADMIN) {
                if (user.role !== client_1.UserRole.PROFESSIONAL) {
                    user = await this.prisma.user.update({
                        where: { id: user.id },
                        data: { role: client_1.UserRole.PROFESSIONAL },
                        include: { professional: true },
                    });
                    this.logger.log(`[Auth] Upgraded existing user ${user.id} to PROFESSIONAL role`);
                }
                if (!user.professional) {
                    await this.prisma.professional.create({
                        data: {
                            userId: user.id,
                            businessName: null,
                            isOnline: false,
                            isVerified: false,
                        },
                    });
                    user = (await this.prisma.user.findUnique({
                        where: { id: user.id },
                        include: { professional: true },
                    }));
                    this.logger.log(`[Auth] Created missing professional record for user ${user.id}`);
                }
            }
        }
        const sessionId = crypto.randomUUID();
        const tokens = await this.generateTokens(user.id, user.role, sessionId);
        await this.redis.set(`session:${user.id}:${sessionId}`, true, this.sessionTtlSeconds);
        return {
            tokens,
            user: this.formatUserProfile(user, isNewUser),
        };
    }
    async refreshToken(dto) {
        const payload = await this.jwtTokenService.verifyRefreshToken(dto.refreshToken);
        const sessionKey = `session:${payload.sub}:${payload.sessionId}`;
        const isSessionActive = await this.redis.get(sessionKey);
        if (!isSessionActive) {
            throw new common_1.UnauthorizedException('Session expired or logged out');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user || user.status === client_1.UserStatus.SUSPENDED) {
            throw new common_1.UnauthorizedException('User account no longer active');
        }
        await this.redis.del(sessionKey);
        const newSessionId = crypto.randomUUID();
        const tokens = await this.generateTokens(user.id, user.role, newSessionId);
        await this.redis.set(`session:${user.id}:${newSessionId}`, true, this.sessionTtlSeconds);
        return tokens;
    }
    async logout(userId, sessionId) {
        const sessionKey = `session:${userId}:${sessionId}`;
        await this.redis.del(sessionKey);
        return {
            success: true,
            message: 'Logged out successfully',
        };
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { professional: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.formatUserProfile(user);
    }
    async generateTokens(userId, role, sessionId) {
        const accessToken = await this.jwtTokenService.signAccessToken({
            sub: userId,
            role,
            sessionId,
        });
        const refreshToken = await this.jwtTokenService.signRefreshToken({
            sub: userId,
            role,
            sessionId,
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: this.jwtTokenService.getExpiresIn(),
        };
    }
    normalizePhone(phone) {
        const trimmed = phone.trim();
        if (trimmed.startsWith('+')) {
            return '+' + trimmed.replace(/\D/g, '');
        }
        const digitsOnly = trimmed.replace(/\D/g, '');
        if (digitsOnly.length === 10) {
            return `+91${digitsOnly}`;
        }
        return `+${digitsOnly}`;
    }
    formatUserProfile(user, isNewUser) {
        return {
            id: user.id,
            phone: user.phone,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            ...(isNewUser !== undefined ? { isNewUser } : {}),
            professional: user.professional
                ? {
                    id: user.professional.id,
                    businessName: user.professional.businessName,
                    isOnline: user.professional.isOnline,
                    isVerified: user.professional.isVerified,
                    kycStatus: user.professional.kycStatus,
                    rating: Number(user.professional.rating),
                    experienceYears: user.professional.experienceYears,
                    visitingCharge: Number(user.professional.visitingCharge),
                }
                : null,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        jwt_service_1.JwtTokenService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map