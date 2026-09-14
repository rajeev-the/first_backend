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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtTokenService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
let JwtTokenService = class JwtTokenService {
    configService;
    secret;
    refreshSecret;
    expiresIn;
    refreshExpiresIn;
    constructor(configService) {
        this.configService = configService;
        this.secret =
            this.configService.get('jwt.secret') ||
                'super_secret_first_choose_jwt_token_key_2026';
        this.refreshSecret =
            this.configService.get('jwt.refreshSecret') ||
                'super_secret_first_choose_refresh_token_key_2026';
        this.expiresIn =
            this.configService.get('jwt.expiresIn') || '7d';
        this.refreshExpiresIn =
            this.configService.get('jwt.refreshExpiresIn') || '30d';
    }
    async signAccessToken(payload) {
        return this.createToken(payload, this.secret, this.expiresIn);
    }
    async signRefreshToken(payload) {
        return this.createToken(payload, this.refreshSecret, this.refreshExpiresIn);
    }
    async verifyAccessToken(token) {
        return this.verifyToken(token, this.secret);
    }
    async verifyRefreshToken(token) {
        return this.verifyToken(token, this.refreshSecret);
    }
    getExpiresIn() {
        return this.expiresIn;
    }
    createToken(payload, secret, expiresInStr) {
        const header = { alg: 'HS256', typ: 'JWT' };
        const nowInSec = Math.floor(Date.now() / 1000);
        const ttlSeconds = this.parseDurationToSeconds(expiresInStr);
        const fullPayload = {
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
    verifyToken(token, secret) {
        if (!token || typeof token !== 'string') {
            throw new common_1.UnauthorizedException('Token is required');
        }
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new common_1.UnauthorizedException('Malformed JWT token structure');
        }
        const [encodedHeader, encodedPayload, signature] = parts;
        const dataToSign = `${encodedHeader}.${encodedPayload}`;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(dataToSign)
            .digest('base64url');
        const sigBuffer = Buffer.from(signature, 'utf-8');
        const expectedSigBuffer = Buffer.from(expectedSignature, 'utf-8');
        if (sigBuffer.length !== expectedSigBuffer.length ||
            !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
            throw new common_1.UnauthorizedException('Invalid token signature');
        }
        let payload;
        try {
            const decodedPayload = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
            payload = JSON.parse(decodedPayload);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid token payload encoding');
        }
        const nowInSec = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < nowInSec) {
            throw new common_1.UnauthorizedException('Token has expired');
        }
        return payload;
    }
    base64UrlEncode(str) {
        return Buffer.from(str, 'utf-8').toString('base64url');
    }
    parseDurationToSeconds(duration) {
        const match = /^(\d+)([smhdwy])?$/.exec(duration.trim());
        if (!match)
            return 7 * 24 * 60 * 60;
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
};
exports.JwtTokenService = JwtTokenService;
exports.JwtTokenService = JwtTokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JwtTokenService);
//# sourceMappingURL=jwt.service.js.map