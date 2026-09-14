import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtTokenService } from '../jwt.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtTokenService: JwtTokenService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: unknown }>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization scheme, Bearer required');
    }

    const payload = await this.jwtTokenService.verifyAccessToken(token);

    // Validate active session in Redis
    const sessionKey = `session:${payload.sub}:${payload.sessionId}`;
    const isSessionActive = await this.redisService.get<boolean>(sessionKey);

    if (!isSessionActive) {
      throw new UnauthorizedException('Session expired or logged out. Please log in again.');
    }

    request.user = {
      ...payload,
      userId: payload.sub,
    };

    return true;
  }
}
