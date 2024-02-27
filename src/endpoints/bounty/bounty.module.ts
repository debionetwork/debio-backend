import { Module } from '@nestjs/common';
import { BountyController } from './bounty.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataStakingEvents } from './models/data-staking-events.entity';
import { DateTimeModule } from '../../common';
import { DataTokenToDatasetMapping } from './models/data-token-to-dataset-mapping.entity';
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
    TypeOrmModule.forFeature([DataStakingEvents, DataTokenToDatasetMapping]),
    DateTimeModule,
  ],
  controllers: [BountyController],
})
export class BountyModule {}
