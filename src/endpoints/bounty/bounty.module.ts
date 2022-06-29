import { Module } from '@nestjs/common';
import { BountyController } from './bounty.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataStakingEvents } from './models/data-staking-events.entity';
import { DateTimeModule } from '../../common';
import { DataTokenToDatasetMapping } from './models/data-token-to-dataset-mapping.entity';
import { GCloudStorageModule } from '@debionetwork/nestjs-gcloud-storage';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';

@Module({
  imports: [
    GCloudSecretManagerModule,
    GCloudStorageModule.withConfigAsync({
      imports: [GCloudSecretManagerModule],
      inject: [GCloudSecretManagerService],
      useFactory: async (
        gCloudSecretManagerService: GCloudSecretManagerService,
      ) => {
        await gCloudSecretManagerService.loadSecrets();
        return {
          defaultBucketname: gCloudSecretManagerService
            .getSecret('BUCKET_NAME')
            .toString(),
          storageBaseUri: gCloudSecretManagerService
            .getSecret('STORAGE_BASE_URI')
            .toString(),
          predefinedAcl: 'private',
        };
      },
    }),
    TypeOrmModule.forFeature([DataStakingEvents, DataTokenToDatasetMapping]),
    DateTimeModule,
  ],
  controllers: [BountyController],
})
export class BountyModule {}
