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
import { RewardModule } from './common/modules/reward/reward.module';
import { VerificationModule } from './endpoints/verification/verification.module';
import { SchedulersModule } from './schedulers/schedulers.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './endpoints/health/health.module';
import { DebioConversionModule } from './common/modules/debio-conversion/debio-conversion.module';
import { EmailEndpointModule } from './endpoints/email/email.module';
import { SubstrateListenerModule } from './listeners/substrate-listener/substrate-listener.module';
import { CachesModule, DateTimeModule } from './common';
import { EthereumListenerModule } from './listeners/ethereum-listener/ethereum-listener.module';
import { TransactionModule } from './endpoints/transaction/transaction.module';
import { SpecializationModule } from './endpoints/category/specialization/specialization.module';
import { NotificationModule } from './endpoints/notification/notification.module';

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
    DateTimeModule,
    CloudStorageModule,
    LocationModule,
    EmailEndpointModule,
    RewardModule,
    RatingModule,
    EmrModule,
    ServiceCategoryModule,
    EthereumListenerModule,
    EscrowModule,
    DebioConversionModule,
    SubstrateEndpointModule,
    TransactionLoggingModule,
    VerificationModule,
    RecaptchaModule,
    BountyModule,
    HealthModule,
    CachesModule,
    SchedulersModule,
    TransactionModule,
    SpecializationModule,
    NotificationModule,
    SubstrateListenerModule,
  ],
})
export class AppModule {}
