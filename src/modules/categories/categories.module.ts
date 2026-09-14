import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { ProblemsController } from './problems.controller';
import { CategoriesService } from './categories.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [CategoriesController, ProblemsController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
