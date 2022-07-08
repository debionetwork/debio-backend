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
import { CachesModule, DateTimeModule } from './common';
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
      inject: [GCloudSecretManagerService],
      useFactory: async (
        gCloudSecretManagerService: GCloudSecretManagerService,
      ) => {
        return {
          type: 'postgres',
          host: gCloudSecretManagerService
            .getSecret('POSTGRES_HOST')
            .toString(),
          port: 5432,
          username: gCloudSecretManagerService
            .getSecret('POSTGRES_USERNAME')
            .toString(),
          password: gCloudSecretManagerService
            .getSecret('POSTGRES_PASSWORD')
            .toString(),
          database: gCloudSecretManagerService
            .getSecret('POSTGRES_DB')
            .toString(),
          entities: [LabRating, TransactionRequest],
          autoLoadEntities: true,
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      name: 'dbLocation',
      inject: [GCloudSecretManagerService],
      useFactory: async (
        gCloudSecretManagerService: GCloudSecretManagerService,
      ) => {
        return {
          type: 'postgres',
          host: gCloudSecretManagerService
            .getSecret('POSTGRES_HOST')
            .toString(),
          port: 5432,
          username: gCloudSecretManagerService
            .getSecret('POSTGRES_USERNAME')
            .toString(),
          password: gCloudSecretManagerService
            .getSecret('POSTGRES_PASSWORD')
            .toString(),
          database: gCloudSecretManagerService
            .getSecret('POSTGRES_DB_LOCATIONS')
            .toString(),
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
