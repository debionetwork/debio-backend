import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthProfessionalRole } from './models/health-professional-role.entity';
import { HealthProfessional } from './models/health-professional.entity';

@Injectable()
export class SecondOpinionService {
  constructor(
    @InjectRepository(HealthProfessional)
    private readonly healthProfessional: Repository<HealthProfessional>,
    @InjectRepository(HealthProfessionalRole)
    private readonly healthProfessionlRole: Repository<HealthProfessionalRole>,) {}

  async findAllHealthProfessional() {
    const healthProfessional = await this.healthProfessional.find();

    return healthProfessional;
  }

  async findAllHealthProfessionalRole() {
    const healthProfessionalRole = await this.healthProfessionlRole.find();

    return healthProfessionalRole;
  }
}
