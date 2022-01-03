import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/typeorm';
import { SentryInterceptor } from 'src/common';
import { ProcessEnvProxy } from 'src/common/process-env';
import { Connection } from 'typeorm';

@UseInterceptors(SentryInterceptor)
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
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
      () => this.http.pingCheck('backend-api', this.process.env.BACKEND_HEALTHCHECK_URL),
    ]);
  }

  @Get('ping')
  test() {
    return "pong";
  }
}