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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const public_decorator_1 = require("../decorators/public.decorator");
const jwt_service_1 = require("../jwt.service");
const redis_service_1 = require("../../redis/redis.service");
let JwtAuthGuard = class JwtAuthGuard {
    reflector;
    jwtTokenService;
    redisService;
    constructor(reflector, jwtTokenService, redisService) {
        this.reflector = reflector;
        this.jwtTokenService = jwtTokenService;
        this.redisService = redisService;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new common_1.UnauthorizedException('Authorization header is missing');
        }
        const [bearer, token] = authHeader.split(' ');
        if (bearer !== 'Bearer' || !token) {
            throw new common_1.UnauthorizedException('Invalid authorization scheme, Bearer required');
        }
        const payload = await this.jwtTokenService.verifyAccessToken(token);
        const sessionKey = `session:${payload.sub}:${payload.sessionId}`;
        const isSessionActive = await this.redisService.get(sessionKey);
        if (!isSessionActive) {
            throw new common_1.UnauthorizedException('Session expired or logged out. Please log in again.');
        }
        request.user = {
            ...payload,
            userId: payload.sub,
        };
        return true;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        jwt_service_1.JwtTokenService,
        redis_service_1.RedisService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map