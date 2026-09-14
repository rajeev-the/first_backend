import { Injectable } from '@nestjs/common';
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

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async check(): Promise<HealthCheckResult> {
    const [isDbConnected, isRedisConnected] = await Promise.all([
      this.prisma.ping(),
      this.redis.ping(),
    ]);

    const isHealthy = isDbConnected && isRedisConnected;
    const isDegraded = isDbConnected || isRedisConnected;

    return {
      status: isHealthy ? 'ok' : isDegraded ? 'degraded' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: {
          status: isDbConnected ? 'connected' : 'disconnected',
          type: 'PostgreSQL + PostGIS (Prisma)',
        },
        redis: {
          status: isRedisConnected ? 'connected' : 'disconnected',
          type: this.redis.getClientType(),
        },
      },
    };
  }
}
