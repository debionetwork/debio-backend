import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthProfessionalRole } from './models/health-professional-role.entity';
import { HealthProfessional } from './models/health-professional.entity';
import { SecondOpinionController } from './second-opinion.controller';
import { SecondOpinionService } from './second-opinion.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HealthProfessional, HealthProfessionalRole]),
  ],
  controllers: [SecondOpinionController],
  providers: [SecondOpinionService],
  exports: [TypeOrmModule],
})
export class SecondOpinionModule {}
