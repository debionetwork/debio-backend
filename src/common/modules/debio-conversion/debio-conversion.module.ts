import { DebioConversionService } from './debio-conversion.service';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
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
          host: gCloudSecretManagerService.getSecret("REDIS_HOST").toString(),
          port: gCloudSecretManagerService.getSecret("REDIS_PORT").toString(),
          auth_pass: gCloudSecretManagerService.getSecret("REDIS_PASSWORD").toString(),
          ttl: 2 * 60 * 60,
        };
      },
    }),
  ],
  providers: [DebioConversionService],
  exports: [DebioConversionService],
})
export class DebioConversionModule {}
