import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { SentryInterceptor } from '../../../common';
import { SpecializationService } from './specialization.service';

@UseInterceptors(SentryInterceptor)
@Controller('specialization-category')
export class SpecializationController {
  constructor(private readonly specializationService: SpecializationService) {}

  @Get()
  getSpecializationCategory() {
    return this.specializationService.getAll();
  }
}
