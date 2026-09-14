import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtTokenService {
  private readonly secret: string;
  private readonly refreshSecret: string;
  private readonly expiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor(private readonly configService: ConfigService) {
    this.secret =
      this.configService.get<string>('jwt.secret') ||
      'super_secret_first_choose_jwt_token_key_2026';
    this.refreshSecret =
      this.configService.get<string>('jwt.refreshSecret') ||
      'super_secret_first_choose_refresh_token_key_2026';
    this.expiresIn =
      this.configService.get<string>('jwt.expiresIn') || '7d';
    this.refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') || '30d';
  }

  async signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
    return this.createToken(payload, this.secret, this.expiresIn);
  }

  async signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
    return this.createToken(payload, this.refreshSecret, this.refreshExpiresIn);
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.verifyToken(token, this.secret);
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.verifyToken(token, this.refreshSecret);
  }

  getExpiresIn(): string {
    return this.expiresIn;
  }

  private createToken(
    payload: Omit<JwtPayload, 'iat' | 'exp'>,
    secret: string,
    expiresInStr: string,
  ): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const nowInSec = Math.floor(Date.now() / 1000);
    const ttlSeconds = this.parseDurationToSeconds(expiresInStr);

    const fullPayload: JwtPayload = {
      ...payload,
      iat: nowInSec,
      exp: nowInSec + ttlSeconds,
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload));
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const signature = crypto
      .createHmac('sha256', secret)
      .update(dataToSign)
      .digest('base64url');

    return `${dataToSign}.${signature}`;
  }

  private verifyToken(token: string, secret: string): JwtPayload {
    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException('Token is required');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Malformed JWT token structure');
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(dataToSign)
      .digest('base64url');

    const sigBuffer = Buffer.from(signature, 'utf-8');
    const expectedSigBuffer = Buffer.from(expectedSignature, 'utf-8');

    if (
      sigBuffer.length !== expectedSigBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)
    ) {
      throw new UnauthorizedException('Invalid token signature');
    }

    let payload: JwtPayload;
    try {
      const decodedPayload = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
      payload = JSON.parse(decodedPayload) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid token payload encoding');
    }

    const nowInSec = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowInSec) {
      throw new UnauthorizedException('Token has expired');
    }

    return payload;
  }

  private base64UrlEncode(str: string): string {
    return Buffer.from(str, 'utf-8').toString('base64url');
  }

  private parseDurationToSeconds(duration: string): number {
    const match = /^(\d+)([smhdwy])?$/.exec(duration.trim());
    if (!match) return 7 * 24 * 60 * 60; // 7 days fallback

    const value = parseInt(match[1], 10);
    const unit = match[2] || 's';

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      case 'w':
        return value * 604800;
      case 'y':
        return value * 31536000;
      default:
        return value;
    }
  }
}
