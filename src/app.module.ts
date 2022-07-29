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
import { AuthenticationModule } from './endpoints/authentication/authentication.module';
import { DnaCollectionModule } from './endpoints/category/dna-collection/dna-collection.module';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';

require('dotenv').config(); // eslint-disable-line

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GCloudSecretManagerModule.withConfig(process.env.PARENT),
    TypeOrmModule.forRootAsync({
      imports: [
        ProcessEnvModule.setDefault({
          PARENT: 'PARENT',
          HOST_POSTGRES: 'HOST_POSTGRES',
          DB_POSTGRES: 'DB_POSTGRES',
          DB_LOCATION: 'DB_LOCATION',
        }),
        GCloudSecretManagerModule.withConfig(process.env.PARENT),
      ],
      inject: [ProcessEnvProxy, GCloudSecretManagerService],
      useFactory: async (
        processEnvProxy: ProcessEnvProxy,
        gCloudSecretManagerService: GCloudSecretManagerService,
      ) => {
        return {
          type: 'postgres',
          host: processEnvProxy.env.HOST_POSTGRES,
          port: 5432,
          username: gCloudSecretManagerService
            .getSecret('POSTGRES_USERNAME')
            .toString(),
          password: gCloudSecretManagerService
            .getSecret('POSTGRES_PASSWORD')
            .toString(),
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
          DB_LOCATION: 'DB_LOCATION',
        }),
        GCloudSecretManagerModule.withConfig(process.env.PARENT),
      ],
      inject: [ProcessEnvProxy, GCloudSecretManagerService],
      useFactory: async (
        processEnvProxy: ProcessEnvProxy,
        gCloudSecretManagerService: GCloudSecretManagerService,
      ) => {
        return {
          type: 'postgres',
          host: processEnvProxy.env.HOST_POSTGRES,
          port: 5432,
          username: gCloudSecretManagerService
            .getSecret('POSTGRES_USERNAME')
            .toString(),
          password: gCloudSecretManagerService
            .getSecret('POSTGRES_PASSWORD')
            .toString(),
          database: processEnvProxy.env.DB_LOCATION,
          entities: [...LocationEntities],
          autoLoadEntities: true,
        };
      },
    }),
    AuthenticationModule,
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
  ],
})
export class AppModule {}
