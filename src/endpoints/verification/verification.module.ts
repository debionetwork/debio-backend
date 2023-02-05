import { CacheModule, Module } from '@nestjs/common';
import { DateTimeModule } from '../../common';
import { TransactionLoggingModule } from '../../common/modules/transaction-logging/transaction-logging.module';
import { SubstrateModule } from '../../common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyriadAccount } from '@endpoints/myriad/models/myriad-account.entity';
import * as redisStore from 'cache-manager-redis-store';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { keyList } from '@common/secrets';
import { MyriadModule } from '@endpoints/myriad/myriad.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [GCloudSecretManagerService],
      useFactory: async (
        gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
      ) => {
        return {
          store: redisStore,
          host: gCloudSecretManagerService.getSecret('REDIS_HOST'),
          port: gCloudSecretManagerService.getSecret('REDIS_PORT'),
          auth_pass: gCloudSecretManagerService.getSecret('REDIS_PASSWORD'),
          ttl: 2 * 60 * 60,
        };
      },
    }),
    SubstrateModule,
    TransactionLoggingModule,
    DateTimeModule,
    TypeOrmModule.forFeature([MyriadAccount]),
    MyriadModule,
  ],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
