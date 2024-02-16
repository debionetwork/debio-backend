import { keyList } from '@common/secrets';
import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyriadAccount } from './models/myriad-account.entity';
import { MyriadController } from './myriad.controller';
import { MyriadService } from './myriad.service';
import * as redisStore from 'cache-manager-redis-store';
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
    TypeOrmModule.forFeature([MyriadAccount]),
  ],
  controllers: [MyriadController],
  providers: [MyriadService],
  exports: [TypeOrmModule, MyriadService],
})
export class MyriadModule {}
