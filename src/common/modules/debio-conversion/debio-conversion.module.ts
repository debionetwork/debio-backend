import { Module } from '@nestjs/common';
import { GoogleSecretManagerModule } from '../google-secret-manager';
import { ProcessEnvModule } from '../proxies';
import { DebioConversionService } from './debio-conversion.service';

@Module({
  imports: [ProcessEnvModule, GoogleSecretManagerModule],
  providers: [DebioConversionService],
  exports: [ProcessEnvModule, DebioConversionService],
})
export class DebioConversionModule {}
