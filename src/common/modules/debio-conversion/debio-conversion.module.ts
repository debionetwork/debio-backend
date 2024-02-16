import { DebioConversionService } from './debio-conversion.service';
import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { keyList } from '../../../common/secrets';
import { config } from 'src/config';

@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [],
      useFactory: async (
      ) => {
        return {
          store: redisStore,
          host: config.REDIS_HOST.toString(),
          port: config.REDIS_PORT.toString(),
          auth_pass: config.REDIS_PASSWORD.toString(),
          ttl: 2 * 60 * 60,
        };
      },
    }),
  ],
  providers: [DebioConversionService],
  exports: [DebioConversionService],
})
export class DebioConversionModule {}
