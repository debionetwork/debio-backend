import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { DebioConversionModule } from 'src/common';
import { CacheController } from './conversion.controller';
import { config } from '../../../config';

@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [],
      useFactory: async () => {
        return {
          store: redisStore,
          host: config.REDIS_HOST,
          port: config.REDIS_PORT,
          auth_pass: config.REDIS_PASSWORD,
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
