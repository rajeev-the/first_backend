import { HealthService, HealthCheckResult } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getHealth(): Promise<HealthCheckResult>;
}
