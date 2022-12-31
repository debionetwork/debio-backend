import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthProfessionalRole } from './models/health-professional-role.entity';
import { HealthProfessionalSpecialization } from './models/health-professional-specialization.entity';
import { Cache } from 'cache-manager';

@Injectable()
export class SecondOpinionService {
  constructor(
    @InjectRepository(HealthProfessionalSpecialization)
    private readonly healthProfessionalSpecialization: Repository<HealthProfessionalSpecialization>,
    @InjectRepository(HealthProfessionalRole)
    private readonly healthProfessionlRole: Repository<HealthProfessionalRole>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findAllHealthProfessionalSpecialization() {
    let healthProfessionalSpecialization = await this.cacheManager.get<
      HealthProfessionalSpecialization[]
    >('health-specialization');

    if (!healthProfessionalSpecialization) {
      healthProfessionalSpecialization =
        await this.healthProfessionalSpecialization.find();
      this.cacheManager.set<HealthProfessionalSpecialization[]>(
        'health-specialization',
        healthProfessionalSpecialization,
      );
    }

    return healthProfessionalSpecialization;
  }

  async findAllHealthProfessionalRole() {
    let healthProfessionalRole = await this.cacheManager.get<
      HealthProfessionalRole[]
    >('health-role');

    if (!healthProfessionalRole) {
      healthProfessionalRole = await this.healthProfessionlRole.find();
      await this.cacheManager.set<HealthProfessionalRole[]>(
        'health-role',
        healthProfessionalRole,
      );
    }

    return healthProfessionalRole;
  }
}
