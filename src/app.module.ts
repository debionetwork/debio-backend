import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabRating } from './rating/models/rating.entity';
import { LocationEntities } from './location/models';
import { LocationModule } from './location/location.module';
import { RatingModule } from './rating/rating.module';
import { EthereumModule } from './ethereum/ethereum.module';
import { EscrowModule } from './escrow/escrow.module';
import { SubstrateModule } from './substrate/substrate.module';
import { CachingModule } from './cache/cache.module';
import { SubstrateIndexedDataModule } from './substrate-indexed-data/substrate-indexed-data.module';
import { EthereumIndexedDataModule } from './ethereum-indexed-data/ethereum-indexed-data.module';
import { TransactionLoggingModule } from './transaction-logging/transaction-logging.module';
import { TransactionRequest } from './transaction-logging/models/transaction-request.entity';
import { RecaptchaModule } from './recaptcha/recaptcha.module';
import { MailModule } from './mail/mail.module';
import { CloudStorageModule } from './cloud-storage/cloud-storage.module';
// import dotenv from 'dotenv';

require('dotenv').config(); // eslint-disable-line
// dotenv.config();
@Module({
  imports: [
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
    RatingModule,
    EthereumModule,
    EscrowModule,
    SubstrateModule,
    CachingModule,
    SubstrateIndexedDataModule,
    EthereumIndexedDataModule,
    TransactionLoggingModule,
    RecaptchaModule,
    MailModule,
  ],
})
export class AppModule {}
