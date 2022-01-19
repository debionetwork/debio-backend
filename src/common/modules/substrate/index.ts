import { Module } from '@nestjs/common';
import { ProcessEnvModule } from '../../proxies';
import { SubstrateService } from './substrate.service';

@Module({
  imports: [ProcessEnvModule],
  providers: [SubstrateService],
  exports: [SubstrateService, ProcessEnvModule],
})
export class SubstrateModule {}

export * from './substrate.service';
