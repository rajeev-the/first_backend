import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis as UpstashRedis } from '@upstash/redis';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private upstashClient: UpstashRedis | null = null;
  private ioRedisClient: Redis | null = null;
  private isUpstash = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const upstashUrl = this.configService.get<string>('redis.upstashUrl');
    const upstashToken = this.configService.get<string>('redis.upstashToken');

    if (upstashUrl && upstashToken) {
      try {
        this.upstashClient = new UpstashRedis({
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
          .catch((err: Error) => {
            this.logger.warn(`Upstash Redis ping failed: ${err.message}`);
          });
        return;
      } catch (error) {
        this.logger.warn(
          `Failed to initialize Upstash Redis: ${(error as Error).message}`,
        );
      }
    }

    // Fallback to local / standard ioredis
    const host = this.configService.get<string>('redis.host') || 'localhost';
    const port = this.configService.get<number>('redis.port') || 6379;
    const password = this.configService.get<string>('redis.password');

    try {
      this.ioRedisClient = new Redis({
        host,
        port,
        password,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
      });

      this.isUpstash = false;
      this.logger.log(`Configured standard Redis client (${host}:${port})`);

      await this.ioRedisClient.connect().catch((err: Error) => {
        this.logger.warn(`Local Redis not reachable: ${err.message}`);
      });
    } catch (error) {
      this.logger.warn(
        `Redis initialization error: ${(error as Error).message}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.ioRedisClient) {
      await this.ioRedisClient.quit().catch(() => {});
    }
  }

  async ping(): Promise<boolean> {
    try {
      if (this.isUpstash && this.upstashClient) {
        const res = await this.upstashClient.ping();
        return res === 'PONG' || typeof res === 'string';
      } else if (this.ioRedisClient && this.ioRedisClient.status === 'ready') {
        const res = await this.ioRedisClient.ping();
        return res === 'PONG';
      }
      return false;
    } catch (error) {
      this.logger.error(`Redis ping error: ${(error as Error).message}`);
      return false;
    }
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      if (this.isUpstash && this.upstashClient) {
        const result = await this.upstashClient.get<T>(key);
        return result ?? null;
      } else if (this.ioRedisClient && this.ioRedisClient.status === 'ready') {
        const val = await this.ioRedisClient.get(key);
        return val ? (JSON.parse(val) as T) : null;
      }
      return null;
    } catch (error) {
      this.logger.error(
        `Redis get error for key "${key}": ${(error as Error).message}`,
      );
      return null;
    }
  }

  async set(
    key: string,
    value: unknown,
    ttlSeconds?: number,
  ): Promise<boolean> {
    try {
      if (this.isUpstash && this.upstashClient) {
        if (ttlSeconds) {
          await this.upstashClient.set(key, value, { ex: ttlSeconds });
        } else {
          await this.upstashClient.set(key, value);
        }
        return true;
      } else if (this.ioRedisClient && this.ioRedisClient.status === 'ready') {
        const serialized = JSON.stringify(value);
        if (ttlSeconds) {
          await this.ioRedisClient.set(key, serialized, 'EX', ttlSeconds);
        } else {
          await this.ioRedisClient.set(key, serialized);
        }
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(
        `Redis set error for key "${key}": ${(error as Error).message}`,
      );
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (this.isUpstash && this.upstashClient) {
        await this.upstashClient.del(key);
        return true;
      } else if (this.ioRedisClient && this.ioRedisClient.status === 'ready') {
        await this.ioRedisClient.del(key);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(
        `Redis del error for key "${key}": ${(error as Error).message}`,
      );
      return false;
    }
  }

  getClientType(): string {
    return this.isUpstash ? 'Upstash Redis (REST)' : 'Standard Redis (ioredis)';
  }
}
