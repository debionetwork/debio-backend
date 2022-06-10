import { Module } from '@nestjs/common';
import { BountyController } from './bounty.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataStakingEvents } from './models/data-staking-events.entity';
import {
  DateTimeModule,
  GoogleSecretManagerModule,
  GoogleSecretManagerService,
} from '../../common';
import { DataTokenToDatasetMapping } from './models/data-token-to-dataset-mapping.entity';
import { GCloudStorageModule } from '@debionetwork/nestjs-gcloud-storage';

@Module({
  imports: [
    GoogleSecretManagerModule,
    GCloudStorageModule.withConfigAsync({
      inject: [GoogleSecretManagerService],
      useFactory: async (
        googleSecretManagerService: GoogleSecretManagerService,
      ) => ({
        defaultBucketname: googleSecretManagerService.bucketName,
        storageBaseUri: googleSecretManagerService.storageBaseUri,
        predefinedAcl: 'private',
      }),
    }),
    TypeOrmModule.forFeature([DataStakingEvents, DataTokenToDatasetMapping]),
    DateTimeModule,
  ],
  controllers: [BountyController],
})
export class BountyModule {}
