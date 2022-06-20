import { CacheModule, Module } from '@nestjs/common';
import { CachesService } from './caches.service';
import * as redisStore from 'cache-manager-redis-store';
import {
  GoogleSecretManagerModule,
  GoogleSecretManagerService,
} from '../google-secret-manager';

require('dotenv').config(); // eslint-disable-line

@Module({
  imports: [
    GoogleSecretManagerModule,
    CacheModule.registerAsync({
      imports: [GoogleSecretManagerModule],
      inject: [GoogleSecretManagerService],
      useFactory: async (
        googleSecretManagerService: GoogleSecretManagerService,
      ) => {
        await googleSecretManagerService.accessAndAccessSecret();
        return {
          store: redisStore,
          host: googleSecretManagerService.hostRedis,
          port: googleSecretManagerService.portRedis,
          auth_pass: googleSecretManagerService.redisPassword,
        };
      },
    }),
  ],
  providers: [CachesService],
  exports: [CachesService],
})
export class CachesModule {}

export * from './caches.service';
