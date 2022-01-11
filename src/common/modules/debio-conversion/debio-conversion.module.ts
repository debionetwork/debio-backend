import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ProcessEnvModule } from '../../../common';
import { DebioConversionService } from './debio-conversion.service';

@Module({
  imports: [
    ProcessEnvModule,
    HttpModule,
  ],
  providers: [DebioConversionService],
  exports: [DebioConversionService],
})
export class DebioConversionModule {}
