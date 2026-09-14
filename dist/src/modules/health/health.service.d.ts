import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
export interface HealthCheckResult {
    status: 'ok' | 'degraded' | 'error';
    timestamp: string;
    uptime: number;
    services: {
        database: {
            status: 'connected' | 'disconnected';
            type: string;
        };
        redis: {
            status: 'connected' | 'disconnected';
            type: string;
        };
    };
}
export declare class HealthService {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    check(): Promise<HealthCheckResult>;
}
