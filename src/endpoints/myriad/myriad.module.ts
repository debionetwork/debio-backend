import { keyList } from '@common/secrets';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyriadAccount } from './models/myriad-account.entity';
import { MyriadController } from './myriad.controller';
import { MyriadService } from './myriad.service';
import * as redisStore from 'cache-manager-redis-store';

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
    TypeOrmModule.forFeature([MyriadAccount])],
  controllers: [MyriadController],
  providers: [MyriadService],
  exports: [TypeOrmModule],
})
export class MyriadModule {}
