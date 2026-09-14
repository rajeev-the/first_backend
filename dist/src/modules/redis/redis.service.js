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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_1 = require("@upstash/redis");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    configService;
    logger = new common_1.Logger(RedisService_1.name);
    upstashClient = null;
    ioRedisClient = null;
    isUpstash = false;
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        const upstashUrl = this.configService.get('redis.upstashUrl');
        const upstashToken = this.configService.get('redis.upstashToken');
        if (upstashUrl && upstashToken) {
            try {
                this.upstashClient = new redis_1.Redis({
                    url: upstashUrl,
                    token: upstashToken,
                });
                this.isUpstash = true;
                this.logger.log('Configured Upstash Redis REST client');
                void this.upstashClient
                    .ping()
                    .then((res) => {
                    this.logger.log(`Upstash Redis ping: ${String(res)}`);
                })
                    .catch((err) => {
                    this.logger.warn(`Upstash Redis ping failed: ${err.message}`);
                });
                return;
            }
            catch (error) {
                this.logger.warn(`Failed to initialize Upstash Redis: ${error.message}`);
            }
        }
        const host = this.configService.get('redis.host') || 'localhost';
        const port = this.configService.get('redis.port') || 6379;
        const password = this.configService.get('redis.password');
        try {
            this.ioRedisClient = new ioredis_1.default({
                host,
                port,
                password,
                lazyConnect: true,
                maxRetriesPerRequest: 1,
                enableOfflineQueue: false,
            });
            this.isUpstash = false;
            this.logger.log(`Configured standard Redis client (${host}:${port})`);
            await this.ioRedisClient.connect().catch((err) => {
                this.logger.warn(`Local Redis not reachable: ${err.message}`);
            });
        }
        catch (error) {
            this.logger.warn(`Redis initialization error: ${error.message}`);
        }
    }
    async onModuleDestroy() {
        if (this.ioRedisClient) {
            await this.ioRedisClient.quit().catch(() => { });
        }
    }
    async ping() {
        try {
            if (this.isUpstash && this.upstashClient) {
                const res = await this.upstashClient.ping();
                return res === 'PONG' || typeof res === 'string';
            }
            else if (this.ioRedisClient && this.ioRedisClient.status === 'ready') {
                const res = await this.ioRedisClient.ping();
                return res === 'PONG';
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Redis ping error: ${error.message}`);
            return false;
        }
    }
    async get(key) {
        try {
            if (this.isUpstash && this.upstashClient) {
                const result = await this.upstashClient.get(key);
                return result ?? null;
            }
            else if (this.ioRedisClient && this.ioRedisClient.status === 'ready') {
                const val = await this.ioRedisClient.get(key);
                return val ? JSON.parse(val) : null;
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Redis get error for key "${key}": ${error.message}`);
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        try {
            if (this.isUpstash && this.upstashClient) {
                if (ttlSeconds) {
                    await this.upstashClient.set(key, value, { ex: ttlSeconds });
                }
                else {
                    await this.upstashClient.set(key, value);
                }
                return true;
            }
            else if (this.ioRedisClient && this.ioRedisClient.status === 'ready') {
                const serialized = JSON.stringify(value);
                if (ttlSeconds) {
                    await this.ioRedisClient.set(key, serialized, 'EX', ttlSeconds);
                }
                else {
                    await this.ioRedisClient.set(key, serialized);
                }
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Redis set error for key "${key}": ${error.message}`);
            return false;
        }
    }
    async del(key) {
        try {
            if (this.isUpstash && this.upstashClient) {
                await this.upstashClient.del(key);
                return true;
            }
            else if (this.ioRedisClient && this.ioRedisClient.status === 'ready') {
                await this.ioRedisClient.del(key);
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Redis del error for key "${key}": ${error.message}`);
            return false;
        }
    }
    getClientType() {
        return this.isUpstash ? 'Upstash Redis (REST)' : 'Standard Redis (ioredis)';
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map