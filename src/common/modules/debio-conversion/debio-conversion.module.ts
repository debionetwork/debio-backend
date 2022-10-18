import { DebioConversionService } from './debio-conversion.service';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { keyList } from '../../../common/secrets';

@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [GCloudSecretManagerService],
      useFactory: async (
        gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
      ) => {
        return {
          store: redisStore,
          host: gCloudSecretManagerService.getSecret("REDIS_HOST"),
          port: gCloudSecretManagerService.getSecret("REDIS_PORT"),
          auth_pass: gCloudSecretManagerService.getSecret("REDIS_PASSWORD"),
          ttl: 2 * 60 * 60,
        };
      },
    }),
    HttpModule,
  ],
  providers: [DebioConversionService],
  exports: [DebioConversionService],
})
export class DebioConversionModule {}
