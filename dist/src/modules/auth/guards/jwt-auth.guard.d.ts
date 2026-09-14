import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtTokenService } from '../jwt.service';
import { RedisService } from '../../redis/redis.service';
export declare class JwtAuthGuard implements CanActivate {
    private readonly reflector;
    private readonly jwtTokenService;
    private readonly redisService;
    constructor(reflector: Reflector, jwtTokenService: JwtTokenService, redisService: RedisService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
