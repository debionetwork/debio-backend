import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthProfessionalRole } from './models/health-professional-role.entity';
import { HealthProfessionalSpecialization } from './models/health-professional-specialization.entity';

@Injectable()
export class SecondOpinionService {
  constructor(
    @InjectRepository(HealthProfessionalSpecialization)
    private readonly healthProfessional: Repository<HealthProfessionalSpecialization>,
    @InjectRepository(HealthProfessionalRole)
    private readonly healthProfessionlRole: Repository<HealthProfessionalRole>,
  ) {}

  async findAllHealthProfessionalSpecialization() {
    const healthProfessional = await this.healthProfessional.find();

    return healthProfessional;
  }

  async findAllHealthProfessionalRole() {
    const healthProfessionalRole = await this.healthProfessionlRole.find();

    return healthProfessionalRole;
  }
}
