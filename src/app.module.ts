import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { EmailSenderModule } from '@email-sender/email-sender.module';
import { keyList, SecretKeyList } from '@common/secrets';
import { ConversionModule } from '@endpoints/conversion/conversion.module';
import { PinataModule } from '@endpoints/pinata/pinata.module';
import { MyriadModule } from '@endpoints/myriad/myriad.module';
import { SecondOpinionModule } from '@endpoints/second-opinion/second-opinion.module';
import { CachesModule, DateTimeModule, DebioConversionModule, ProcessEnvModule, ProcessEnvProxy, TransactionLoggingModule } from '@common/modules';
import { LabRating } from '@endpoints/rating/models/rating.entity';
import { TransactionRequest } from '@common/modules/transaction-logging/models/transaction-request.entity';
import { LocationEntities } from '@endpoints/location/models';
import { CloudStorageModule } from '@endpoints/cloud-storage/cloud-storage.module';
import { LocationModule } from '@endpoints/location/location.module';
import { EmailEndpointModule } from '@endpoints/email/email.module';
import { RatingModule } from '@endpoints/rating/rating.module';
import { DnaCollectionModule } from '@endpoints/category/dna-collection/dna-collection.module';
import { NotificationEndpointModule } from '@endpoints/notification-endpoint/notification-endpoint.module';
import { SpecializationModule } from '@endpoints/category/specialization/specialization.module';
import { TransactionModule } from '@endpoints/transaction/transaction.module';
import { HealthModule } from '@endpoints/health/health.module';
import { BountyModule } from '@endpoints/bounty/bounty.module';
import { VerificationModule } from '@endpoints/verification/verification.module';
import { RecaptchaModule } from '@endpoints/recaptcha/recaptcha.module';
import { SubstrateEndpointModule } from '@endpoints/substrate-endpoint/substrate-endpoint.module';
import { EscrowModule } from '@common/modules/escrow/escrow.module';
import { EmrModule } from '@endpoints/category/emr/emr.module';
import { ServiceCategoryModule } from '@endpoints/category/service/service-category.module';

require('dotenv').config(); // eslint-disable-line

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GCloudSecretManagerModule.withConfig(process.env.PARENT, SecretKeyList),
    TypeOrmModule.forRootAsync({
      imports: [
        ProcessEnvModule.setDefault({
          PARENT: 'PARENT',
          HOST_POSTGRES: 'HOST_POSTGRES',
          DB_POSTGRES: 'DB_POSTGRES',
          DB_LOCATIONS: 'DB_LOCATIONS',
        }),
        GCloudSecretManagerModule.withConfig(process.env.PARENT, SecretKeyList),
      ],
      inject: [ProcessEnvProxy, GCloudSecretManagerService],
      useFactory: async (
        processEnvProxy: ProcessEnvProxy,
        gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
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
          DB_LOCATIONS: 'DB_LOCATIONS',
        }),
        GCloudSecretManagerModule.withConfig(process.env.PARENT, SecretKeyList),
      ],
      inject: [ProcessEnvProxy, GCloudSecretManagerService],
      useFactory: async (
        processEnvProxy: ProcessEnvProxy,
        gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
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
    EmailSenderModule,
  ],
})
export class AppModule {}
