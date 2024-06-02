import { Module } from '@nestjs/common';
import { GCloudStorageModule } from '@debionetwork/nestjs-gcloud-storage';
import { CloudStorageController } from './cloud-storage.controller';
import { DateTimeModule } from '../../common';
import { config } from '../../config';

@Module({
  imports: [
    GCloudStorageModule.withConfigAsync({
      inject: [],
      useFactory: async () => {
        return {
          defaultBucketname: config.BUCKET_NAME.toString(),
          storageBaseUri: config.STORAGE_BASE_URI.toString(),
          predefinedAcl: 'private',
        };
      },
    }),
    DateTimeModule,
  ],
  controllers: [CloudStorageController],
})
export class CloudStorageModule {}
