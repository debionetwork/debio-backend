import { Module } from '@nestjs/common';
import { CloudStorageController } from './cloud-storage.controller';
import { DateTimeModule } from '../../common';
import { config } from '../../config';
import { NestMinioModule } from 'nestjs-minio';

@Module({
  imports: [
    NestMinioModule.register({
      endPoint: config.MINIO_ENDPOINT,
      port: config.MINIO_PORT as number,
      useSSL: true,
      accessKey: config.MINIO_ACCESS_KEY,
      secretKey: config.MINIO_SECRET_KEY,
    }),
    DateTimeModule,
  ],
  controllers: [CloudStorageController],
})
export class CloudStorageModule {}
