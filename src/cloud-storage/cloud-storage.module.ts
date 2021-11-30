import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GCloudStorageModule } from '@aginix/nestjs-gcloud-storage';
import { CloudStorageController } from './cloud-storage.controller';
import { DateTimeModule } from 'src/common/date-time/date-time.module';

require('dotenv').config(); // eslint-disable-line

@Module({
  imports: [
    GCloudStorageModule.withConfig({
      defaultBucketname: process.env.BUCKET_NAME,
      storageBaseUri: process.env.STORAGE_BASE_URI,
      predefinedAcl: 'private',
    }),
    DateTimeModule,
  ],
  controllers: [CloudStorageController],
})
export class CloudStorageModule {}
