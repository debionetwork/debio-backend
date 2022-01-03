import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck, TypeOrmHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/typeorm';
import { ElasticsearchHealthIndicator, ProcessEnvProxy } from 'src/common';
import { Connection } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private elasticSearch: ElasticsearchHealthIndicator,
    @InjectConnection('dbLocation')
    private dbLocationConnection: Connection,
    @InjectConnection()
    private defaultConnection: Connection,
    private process: ProcessEnvProxy
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database', { connection: this.defaultConnection }),
      () => this.db.pingCheck('location-database', { connection: this.dbLocationConnection }),
      () => this.memory.checkHeap('memory heap', 300 * 1024 * 1024),
      () => this.disk.checkStorage('disk health', {
        thresholdPercent: 0.5, path: '/'
      }),
      () => this.elasticSearch.isHealthy('elasticsearch')
    ]);
  }
}