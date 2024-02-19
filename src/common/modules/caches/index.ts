import { CacheModule, Module } from '@nestjs/common';
import { CachesService } from './caches.service';
import * as redisStore from 'cache-manager-redis-store';
import { config } from '../../../config';

@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [],
      useFactory: async () => {
        return {
          store: redisStore,
          host: config.REDIS_HOST.toString(),
          port: config.REDIS_PORT.toString(),
          auth_pass: config.REDIS_PASSWORD.toString(),
        };
      },
    }),
  ],
  providers: [CachesService],
  exports: [CachesService],
})
export class CachesModule {}

export * from './caches.service';
