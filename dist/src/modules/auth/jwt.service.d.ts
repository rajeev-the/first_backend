import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';
export declare class JwtTokenService {
    private readonly configService;
    private readonly secret;
    private readonly refreshSecret;
    private readonly expiresIn;
    private readonly refreshExpiresIn;
    constructor(configService: ConfigService);
    signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string>;
    signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string>;
    verifyAccessToken(token: string): Promise<JwtPayload>;
    verifyRefreshToken(token: string): Promise<JwtPayload>;
    getExpiresIn(): string;
    private createToken;
    private verifyToken;
    private base64UrlEncode;
    private parseDurationToSeconds;
}
