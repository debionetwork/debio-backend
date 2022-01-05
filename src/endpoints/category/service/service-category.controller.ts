import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { SentryInterceptor } from '../../../common';
import { ServiceCategoryService } from './service-category.service';

@UseInterceptors(SentryInterceptor)
@Controller('service-category')
export class ServiceCategoryController {
  constructor(
    private readonly serviceCategoryService: ServiceCategoryService,
  ) {}

  @Get()
  getServiceCategory() {
    try {
      return this.serviceCategoryService.getAll();
    } catch (error) {
      console.log(error);
    }
  }
}
