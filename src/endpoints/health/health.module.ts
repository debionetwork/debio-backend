import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { ElasticsearchHealthModule, SubstrateHealthModule } from '../../common';

@Module({
  imports: [
    TerminusModule, 
    ElasticsearchHealthModule, 
    SubstrateHealthModule
  ],
  controllers: [HealthController],
})
export class HealthModule {}
