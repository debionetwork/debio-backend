import { keyList } from '@common/secrets';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthProfessionalRole } from './models/health-professional-role.entity';
import { HealthProfessionalSpecialization } from './models/health-professional-specialization.entity';
import { SecondOpinionController } from './second-opinion.controller';
import { SecondOpinionService } from './second-opinion.service';
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
