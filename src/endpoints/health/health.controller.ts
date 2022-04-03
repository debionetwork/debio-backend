import { Controller, Get, UseInterceptors } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import {
  ElasticsearchHealthIndicator,
  SubstrateHealthIndicator,
  SentryInterceptor,
} from '../../common';

@UseInterceptors(SentryInterceptor)
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private elasticSearch: ElasticsearchHealthIndicator,
    private substrate: SubstrateHealthIndicator,
    @InjectConnection('dbLocation')
    private dbLocationConnection: Connection,
    @InjectConnection()
    private defaultConnection: Connection,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () =>
        this.db.pingCheck('database', { connection: this.defaultConnection }),
      () =>
        this.db.pingCheck('location-database', {
          connection: this.dbLocationConnection,
        }),
      () => {
        try {
          return this.memory.checkHeap('memory heap', 1000 * 1024 * 1024);
        }
        catch {
          const indicator: HealthIndicatorResult = {
            ['memory-heap']: {
              status: 'down',
            },
          };
          return new Promise((resolve, _) => resolve(indicator)); // eslint-disable-line
        }
      },
      () => {
        try {
          return this.disk.checkStorage('disk health', {
            thresholdPercent: 0.5,
            path: '/',
          });
        }
        catch {
          const indicator: HealthIndicatorResult = {
            ['disk-health']: {
              status: 'down',
            },
          };
          return new Promise((resolve, _) => resolve(indicator)); // eslint-disable-line
        }
      },
      () => this.elasticSearch.isHealthy(),
      () => this.substrate.isHealthy(),
    ]);
  }
}
