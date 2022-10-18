import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { DebioConversionModule } from 'src/common';
import { keyList } from '../../common/secrets';
import { CacheController } from './conversion.controller';

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
    DebioConversionModule,
  ],
  controllers: [CacheController],
})
export class ConversionModule {}