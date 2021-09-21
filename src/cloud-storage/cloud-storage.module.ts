import { Module } from '@nestjs/common';
import { GCloudStorageModule } from '@aginix/nestjs-gcloud-storage';

require('dotenv').config(); // eslint-disable-line

@Module({
  imports: [
    GCloudStorageModule.withConfig({
      defaultBucketname: process.env.BUCKET_NAME,
      storageBaseUri: process.env.STORAGE_BASE_URI,
      predefinedAcl: 'private'
    })
  ],
})
export class CloudStorageModule {}
