import { Module } from '@nestjs/common';
import { GCloudStorageModule } from '@debionetwork/nestjs-gcloud-storage';
import { CloudStorageController } from './cloud-storage.controller';
import {
  DateTimeModule,
  GoogleSecretManagerModule,
  GoogleSecretManagerService,
} from '../../common';

require('dotenv').config(); // eslint-disable-line

@Module({
  imports: [
    GCloudStorageModule.withConfigAsync({
      imports: [GoogleSecretManagerModule],
      inject: [GoogleSecretManagerService],
      useFactory: async (
        googleSecretManagerService: GoogleSecretManagerService,
      ) => {
        await googleSecretManagerService.accessSecret();
        return {
          defaultBucketname: googleSecretManagerService.bucketName,
          storageBaseUri: googleSecretManagerService.storageBaseUri,
          predefinedAcl: 'private',
        };
      },
    }),
    DateTimeModule,
  ],
  controllers: [CloudStorageController],
})
export class CloudStorageModule {}
