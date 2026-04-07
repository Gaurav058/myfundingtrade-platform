import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Basic liveness probe' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'myfundingtrade-api',
      version: process.env.npm_package_version || '0.0.1',
    };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe — checks database + Redis connectivity' })
  async readiness() {
    return this.healthService.checkReadiness();
  }
}
