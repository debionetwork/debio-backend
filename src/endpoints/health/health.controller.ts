import { Controller, Get, UseInterceptors } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
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

  @Get('server')
  @HealthCheck()
  serverCheck() {
    return this.health.check([
      () => this.memory.checkHeap('memory heap', 1000 * 1024 * 1024),
      () =>
        this.disk.checkStorage('disk health', {
          thresholdPercent: 0.5,
          path: '/',
        }),
    ]);
  }

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
      () => this.elasticSearch.isHealthy(),
      () => this.substrate.isHealthy(),
    ]);
  }
}
