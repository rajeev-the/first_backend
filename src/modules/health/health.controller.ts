import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService, HealthCheckResult } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: '🌐 [PUBLIC] System Health Check',
    description:
      '🌐 **Access:** Public\n\nCheck connectivity for PostgreSQL database and Redis instance',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns health status of PostgreSQL and Redis',
  })
  async getHealth(): Promise<HealthCheckResult> {
    return this.healthService.check();
  }
}
