import { Module } from '@nestjs/common';
import { DebioConversionService } from './debio-conversion.service';

require('dotenv').config(); // eslint-disable-line

@Module({
  providers: [DebioConversionService],
  exports: [DebioConversionService],
})
export class DebioConversionModule {}
