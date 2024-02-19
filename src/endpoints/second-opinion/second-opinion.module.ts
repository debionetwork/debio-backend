import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthProfessionalRole } from './models/health-professional-role.entity';
import { HealthProfessionalSpecialization } from './models/health-professional-specialization.entity';
import { SecondOpinionController } from './second-opinion.controller';
import { SecondOpinionService } from './second-opinion.service';
import * as redisStore from 'cache-manager-redis-store';
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
    TypeOrmModule.forFeature([
      HealthProfessionalSpecialization,
      HealthProfessionalRole,
    ]),
  ],
  controllers: [SecondOpinionController],
  providers: [SecondOpinionService],
  exports: [TypeOrmModule],
})
export class SecondOpinionModule {}
