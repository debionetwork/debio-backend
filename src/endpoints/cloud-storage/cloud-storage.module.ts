import { Module } from '@nestjs/common';
import { GCloudStorageModule } from '@debionetwork/nestjs-gcloud-storage';
import { CloudStorageController } from './cloud-storage.controller';
import { DateTimeModule } from '../../common';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';

require('dotenv').config(); // eslint-disable-line

@Module({
  imports: [
    GCloudStorageModule.withConfigAsync({
      inject: [GCloudSecretManagerService],
      useFactory: async (
        gCloudSecretManagerService: GCloudSecretManagerService,
      ) => {
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
    DateTimeModule,
  ],
  controllers: [CloudStorageController],
})
export class CloudStorageModule {}
