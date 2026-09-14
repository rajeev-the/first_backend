import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { JwtTokenService } from './jwt.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponse, AuthTokens, SendOtpResponse, UserProfileResponse } from './interfaces/auth-response.interface';
export declare class AuthService {
    private readonly prisma;
    private readonly redis;
    private readonly jwtTokenService;
    private readonly configService;
    private readonly logger;
    private readonly isDev;
    private readonly otpTtlSeconds;
    private readonly sessionTtlSeconds;
    constructor(prisma: PrismaService, redis: RedisService, jwtTokenService: JwtTokenService, configService: ConfigService);
    sendOtp(dto: SendOtpDto): Promise<SendOtpResponse>;
    verifyOtp(dto: VerifyOtpDto): Promise<AuthResponse>;
    refreshToken(dto: RefreshTokenDto): Promise<AuthTokens>;
    logout(userId: string, sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getMe(userId: string): Promise<UserProfileResponse>;
    private generateTokens;
    private normalizePhone;
    private formatUserProfile;
}
