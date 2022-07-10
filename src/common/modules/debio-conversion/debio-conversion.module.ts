import { Module } from '@nestjs/common';
import { DebioConversionService } from './debio-conversion.service';

@Module({
  providers: [DebioConversionService],
  exports: [DebioConversionService],
})
export class DebioConversionModule {}
