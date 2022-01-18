import { Module } from '@nestjs/common';
import { ProcessEnvModule } from '../../proxies/process-env';
import { DebioConversionService } from './debio-conversion.service';

@Module({
  imports: [
    ProcessEnvModule,
  ],
  providers: [DebioConversionService],
  exports: [DebioConversionService],
})
export class DebioConversionModule {}
