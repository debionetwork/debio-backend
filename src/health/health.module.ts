import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ElasticsearchHealthModule, ProcessEnvModule } from 'src/common';

@Module({
  imports: [
    TerminusModule,
    ProcessEnvModule,
    HttpModule,
    ElasticsearchHealthModule
  ],
  controllers: [HealthController],
})
export class HealthModule {}