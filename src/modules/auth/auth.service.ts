import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { UserRole, UserStatus, User, Professional } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { JwtTokenService } from './jwt.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  AuthResponse,
  AuthTokens,
  SendOtpResponse,
  UserProfileResponse,
} from './interfaces/auth-response.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly isDev: boolean;
  private readonly otpTtlSeconds = 300; // 5 minutes
  private readonly sessionTtlSeconds = 30 * 24 * 60 * 60; // 30 days

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly configService: ConfigService,
  ) {
    this.isDev = this.configService.get<string>('app.nodeEnv') !== 'production';
  }

  async sendOtp(dto: SendOtpDto): Promise<SendOtpResponse> {
    const cleanedPhone = this.normalizePhone(dto.phone);

    // Development mock OTP
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

  async verifyOtp(dto: VerifyOtpDto): Promise<AuthResponse> {
    const cleanedPhone = this.normalizePhone(dto.phone);
    const otpKey = `otp:${cleanedPhone}`;

    const storedOtp = await this.redis.get<string>(otpKey);

    // In development mode, also accept '1234' and '123456' as default fallback
    const isMockValid = this.isDev && (dto.otp === '1234' || dto.otp === '123456');
    const isStoredValid = storedOtp && storedOtp.toString() === dto.otp.trim();

    if (!isStoredValid && !isMockValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Clean up OTP key once verified
    await this.redis.del(otpKey);

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phone: cleanedPhone },
      include: { professional: true },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const role = dto.role || UserRole.CUSTOMER;

      user = await this.prisma.user.create({
        data: {
          phone: cleanedPhone,
          role,
          status: UserStatus.ACTIVE,
          ...(role === UserRole.PROFESSIONAL
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
    } else {
      if (user.status === UserStatus.SUSPENDED) {
        throw new ForbiddenException('Your account has been suspended. Please contact support.');
      }

      // If user logs in as PROFESSIONAL and doesn't have the role or professional record, upgrade them
      if (dto.role === UserRole.PROFESSIONAL && user.role !== UserRole.ADMIN) {
        if (user.role !== UserRole.PROFESSIONAL) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { role: UserRole.PROFESSIONAL },
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
          }))!;
          this.logger.log(`[Auth] Created missing professional record for user ${user.id}`);
        }
      }
    }

    const sessionId = crypto.randomUUID();
    const tokens = await this.generateTokens(user.id, user.role, sessionId);

    // Store active session in Redis
    await this.redis.set(`session:${user.id}:${sessionId}`, true, this.sessionTtlSeconds);

    return {
      tokens,
      user: this.formatUserProfile(user, isNewUser),
    };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<AuthTokens> {
    const payload = await this.jwtTokenService.verifyRefreshToken(dto.refreshToken);

    const sessionKey = `session:${payload.sub}:${payload.sessionId}`;
    const isSessionActive = await this.redis.get<boolean>(sessionKey);

    if (!isSessionActive) {
      throw new UnauthorizedException('Session expired or logged out');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('User account no longer active');
    }

    // Invalidate old session and create fresh rotated session
    await this.redis.del(sessionKey);
    const newSessionId = crypto.randomUUID();
    const tokens = await this.generateTokens(user.id, user.role, newSessionId);

    await this.redis.set(`session:${user.id}:${newSessionId}`, true, this.sessionTtlSeconds);

    return tokens;
  }

  async logout(userId: string, sessionId: string): Promise<{ success: boolean; message: string }> {
    const sessionKey = `session:${userId}:${sessionId}`;
    await this.redis.del(sessionKey);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  async getMe(userId: string): Promise<UserProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { professional: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.formatUserProfile(user);
  }

  private async generateTokens(
    userId: string,
    role: UserRole,
    sessionId: string,
  ): Promise<AuthTokens> {
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

  private normalizePhone(phone: string): string {
    const trimmed = phone.trim();
    if (trimmed.startsWith('+')) {
      return '+' + trimmed.replace(/\D/g, '');
    }
    const digitsOnly = trimmed.replace(/\D/g, '');
    // Standardize 10 digit Indian number with +91 if not specified
    if (digitsOnly.length === 10) {
      return `+91${digitsOnly}`;
    }
    return `+${digitsOnly}`;
  }

  private formatUserProfile(
    user: User & { professional?: Professional | null },
    isNewUser?: boolean,
  ): UserProfileResponse {
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
}
