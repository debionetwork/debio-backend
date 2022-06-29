import { GCloudSecretManagerModule } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Module } from '@nestjs/common';
import { SubstrateService } from './substrate.service';

@Module({
  imports: [GCloudSecretManagerModule],
  providers: [SubstrateService],
  exports: [GCloudSecretManagerModule, SubstrateService],
})
export class SubstrateModule {}

export * from './substrate.service';
