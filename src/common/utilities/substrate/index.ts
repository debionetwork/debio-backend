import { Module } from '@nestjs/common';
import { SubstrateService } from './substrate.service';

@Module({
  providers: [SubstrateService],
  exports: [SubstrateService],
})
export class SubstrateModule {}

export * from './substrate.service';