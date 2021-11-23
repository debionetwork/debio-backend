import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GCloudStorageModule } from '@aginix/nestjs-gcloud-storage';
import { CloudStorageController } from './cloud-storage.controller';
import { DataStakingSyncEvents } from './models/data-staking-sync-events.entity';

require('dotenv').config(); // eslint-disable-line

@Module({
  imports: [
    GCloudStorageModule.withConfig({
      defaultBucketname: process.env.BUCKET_NAME,
      storageBaseUri: process.env.STORAGE_BASE_URI,
      predefinedAcl: 'private',
    }),
    TypeOrmModule.forFeature([DataStakingSyncEvents]),
  ],
  exports: [TypeOrmModule],
  controllers: [CloudStorageController],
})
export class CloudStorageModule {}
