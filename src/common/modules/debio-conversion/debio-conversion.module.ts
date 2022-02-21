import { Module } from '@nestjs/common';
import { ProcessEnvModule } from '../proxies';
import { DebioConversionService } from './debio-conversion.service';

@Module({
  imports: [ProcessEnvModule],
  providers: [DebioConversionService],
  exports: [ProcessEnvModule, DebioConversionService],
})
export class DebioConversionModule {}
