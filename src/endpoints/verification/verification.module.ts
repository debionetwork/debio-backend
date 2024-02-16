import { CacheModule, Module } from '@nestjs/common';
import { DateTimeModule } from '../../common';
import { TransactionLoggingModule } from '../../common/modules/transaction-logging/transaction-logging.module';
import { SubstrateModule } from '../../common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyriadAccount } from '@endpoints/myriad/models/myriad-account.entity';
import * as redisStore from 'cache-manager-redis-store';
import { MyriadModule } from '@endpoints/myriad/myriad.module';
import { config } from 'src/config';

@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [],
      useFactory: async (
      ) => {
        return {
          store: redisStore,
          host: config.REDIS_HOST,
          port: config.REDIS_PORT,
          auth_pass: config.REDIS_PASSWORD,
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
