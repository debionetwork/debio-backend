import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabRating } from './rating/models/rating.entity';
import { LocationEntities } from './location/models';
import { LocationModule } from './location/location.module';
import { RatingModule } from './rating/rating.module';
import { EthereumModule } from './ethereum/ethereum.module';
import { EscrowModule } from './escrow/escrow.module';
import { SubstrateModule } from './substrate/substrate.module';
import { SubstrateIndexedDataModule } from './substrate-indexed-data/substrate-indexed-data.module';
import { EthereumIndexedDataModule } from './ethereum-indexed-data/ethereum-indexed-data.module';
import { TransactionLoggingModule } from './transaction-logging/transaction-logging.module';
import { TransactionRequest } from './transaction-logging/models/transaction-request.entity';
import { RecaptchaModule } from './recaptcha/recaptcha.module';
import { CloudStorageModule } from './cloud-storage/cloud-storage.module';
import { BountyModule } from './bounty/bounty.module';
import { EmrModule } from './category/emr/emr.module';
import { ServiceCategoryModule } from './category/service/service-category.module';
import { RewardModule } from './reward/reward.module';
import { VerificationModule } from './endpoints/verification/verification.module';
import { SchedulersModule } from './schedulers/schedulers.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './health/health.module';
import { DebioConversionModule } from './debio-conversion/debio-conversion.module';

require('dotenv').config(); // eslint-disable-line

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.HOST_POSTGRES,
      port: 5432,
      username: process.env.USERNAME_POSTGRES,
      password: process.env.PASSWORD_POSTGRES,
      database: process.env.DB_POSTGRES,
      entities: [LabRating, TransactionRequest],
      autoLoadEntities: true,
    }),
    TypeOrmModule.forRoot({
      name: 'dbLocation',
      type: 'postgres',
      host: process.env.HOST_POSTGRES,
      port: 5432,
      username: process.env.USERNAME_POSTGRES,
      password: process.env.PASSWORD_POSTGRES,
      database: process.env.DB_LOCATIONS,
      entities: [...LocationEntities],
      autoLoadEntities: true,
    }),
    CloudStorageModule,
    LocationModule,
    RewardModule,
    RatingModule,
    EmrModule,
    ServiceCategoryModule,
    EthereumModule,
    EscrowModule,
    DebioConversionModule,
    SubstrateModule,
    SubstrateIndexedDataModule,
    EthereumIndexedDataModule,
    TransactionLoggingModule,
    VerificationModule,
    RecaptchaModule,
    BountyModule,
    SchedulersModule,
    HealthModule
  ],
})
export class AppModule {}
