import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SentryInterceptor } from '../../../common';
import { specializtionCategories } from './models/response';
import { SpecializationService } from './specialization.service';

@UseInterceptors(SentryInterceptor)
@Controller('specialization-category')
export class SpecializationController {
  constructor(private readonly specializationService: SpecializationService) {}

  @Get()
  @ApiOperation({description: 'get categories of genetic analyst specialization.'})
  @ApiResponse({
    status: 200,
    schema: {
      example: specializtionCategories
    }
  })
  getSpecializationCategory() {
    return this.specializationService.getAll();
  }
}
