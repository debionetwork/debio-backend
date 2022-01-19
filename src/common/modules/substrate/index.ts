import { forwardRef, Module } from '@nestjs/common';
import { ProcessEnvModule } from '../..';
import { SubstrateService } from './substrate.service';

@Module({
  imports: [ProcessEnvModule],
  providers: [SubstrateService],
  exports: [SubstrateService],
})
export class SubstrateModule {}

export * from './substrate.service';
