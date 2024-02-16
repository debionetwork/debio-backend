import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabRating } from './endpoints/rating/models/rating.entity';
import { LocationEntities } from './endpoints/location/models';
import { LocationModule } from './endpoints/location/location.module';
import { RatingModule } from './endpoints/rating/rating.module';
import { EscrowModule } from './common/modules/escrow/escrow.module';
import { SubstrateEndpointModule } from './endpoints/substrate-endpoint/substrate-endpoint.module';
import { TransactionLoggingModule } from './common/modules/transaction-logging/transaction-logging.module';
import { TransactionRequest } from './common/modules/transaction-logging/models/transaction-request.entity';
import { RecaptchaModule } from './endpoints/recaptcha/recaptcha.module';
import { CloudStorageModule } from './endpoints/cloud-storage/cloud-storage.module';
import { BountyModule } from './endpoints/bounty/bounty.module';
import { EmrModule } from './endpoints/category/emr/emr.module';
import { ServiceCategoryModule } from './endpoints/category/service/service-category.module';
import { VerificationModule } from './endpoints/verification/verification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './endpoints/health/health.module';
import { DebioConversionModule } from './common/modules/debio-conversion/debio-conversion.module';
import { EmailEndpointModule } from './endpoints/email/email.module';
import {
  CachesModule,
  DateTimeModule,
  ProcessEnvModule,
  ProcessEnvProxy,
} from './common';
import { TransactionModule } from './endpoints/transaction/transaction.module';
import { SpecializationModule } from './endpoints/category/specialization/specialization.module';
import { NotificationEndpointModule } from './endpoints/notification-endpoint/notification-endpoint.module';
import { DnaCollectionModule } from './endpoints/category/dna-collection/dna-collection.module';
import { ConversionModule } from './endpoints/conversion/conversion.module';
import { PinataModule } from './endpoints/pinata/pinata.module';
import { MyriadModule } from './endpoints/myriad/myriad.module';
import { SecondOpinionModule } from './endpoints/second-opinion/second-opinion.module';
import { config } from './config';

require('dotenv').config(); // eslint-disable-line

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [
        ProcessEnvModule.setDefault({
          PARENT: 'PARENT',
          HOST_POSTGRES: 'HOST_POSTGRES',
          DB_POSTGRES: 'DB_POSTGRES',
          DB_LOCATIONS: 'DB_LOCATIONS',
        }),
      ],
      inject: [ProcessEnvProxy],
      useFactory: async (
        processEnvProxy: ProcessEnvProxy,
      ) => {
        return {
          type: 'postgres',
          host: processEnvProxy.env.HOST_POSTGRES,
          port: 5432,
          username: config.POSTGRES_USERNAME.toString(),
          password: config.POSTGRES_PASSWORD.toString(),
          database: processEnvProxy.env.DB_POSTGRES,
          entities: [LabRating, TransactionRequest],
          autoLoadEntities: true,
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      name: 'dbLocation',
      imports: [
        ProcessEnvModule.setDefault({
          PARENT: 'PARENT',
          HOST_POSTGRES: 'HOST_POSTGRES',
          DB_POSTGRES: 'DB_POSTGRES',
          DB_LOCATIONS: 'DB_LOCATIONS',
        }),
      ],
      inject: [ProcessEnvProxy],
      useFactory: async (
        processEnvProxy: ProcessEnvProxy,
      ) => {
        return {
          type: 'postgres',
          host: processEnvProxy.env.HOST_POSTGRES,
          port: 5432,
          username: config.POSTGRES_USERNAME.toString(),
          password: config.POSTGRES_PASSWORD.toString(),
          database: processEnvProxy.env.DB_LOCATIONS,
          entities: [...LocationEntities],
          autoLoadEntities: true,
        };
      },
    }),
    DateTimeModule,
    CloudStorageModule,
    LocationModule,
    EmailEndpointModule,
    RatingModule,
    EmrModule,
    ServiceCategoryModule,
    EscrowModule,
    DebioConversionModule,
    SubstrateEndpointModule,
    TransactionLoggingModule,
    VerificationModule,
    RecaptchaModule,
    BountyModule,
    HealthModule,
    CachesModule,
    TransactionModule,
    SpecializationModule,
    NotificationEndpointModule,
    DnaCollectionModule,
    ConversionModule,
    PinataModule,
    MyriadModule,
    SecondOpinionModule,
  ],
})
export class AppModule {}
