import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { ProcessEnvModule } from 'src/common/process-env';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TerminusModule,
    ProcessEnvModule,
    HttpModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}