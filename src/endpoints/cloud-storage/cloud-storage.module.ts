import { Module } from '@nestjs/common';
import { CloudStorageController } from './cloud-storage.controller';
import { DateTimeModule } from '../../common';
import { config } from '../../config';
import { NestMinioModule } from 'nestjs-minio';

@Module({
  imports: [
    NestMinioModule.register({
      endPoint: 'play.min.io',
      port: 9000,
      useSSL: true,
      accessKey: 'Q3AM3UQ867SPQQA43P2F',
      secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG',
    }),
    DateTimeModule,
  ],
  controllers: [CloudStorageController],
})
export class CloudStorageModule {}
