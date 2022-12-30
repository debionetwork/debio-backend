import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthProfessionalRole } from './models/health-professional-role.entity';
import { HealthProfessionalSpecialization } from './models/health-professional-specialization.entity';
import { SecondOpinionController } from './second-opinion.controller';
import { SecondOpinionService } from './second-opinion.service';

@Module({
  imports: [
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
