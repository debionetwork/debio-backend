import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { SubstrateModule } from '../../substrate';
import { SubstrateHealthIndicator } from './substrate.health.indicator';

@Module({
  imports: [TerminusModule, SubstrateModule],
  exports: [SubstrateModule, SubstrateHealthIndicator],
  providers: [SubstrateHealthIndicator],
})
export class SubstrateHealthModule {}

export * from './substrate.health.indicator';
