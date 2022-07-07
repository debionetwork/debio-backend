import { GCloudSecretManagerModule } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Module } from '@nestjs/common';
import { ProcessEnvModule } from '../proxies';
import { DebioConversionService } from './debio-conversion.service';

@Module({
  imports: [
    ProcessEnvModule,
    GCloudSecretManagerModule.withConfig(process.env.PARENT),
  ],
  providers: [DebioConversionService],
  exports: [ProcessEnvModule, DebioConversionService],
})
export class DebioConversionModule {}
