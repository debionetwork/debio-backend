import { Controller, Get } from '@nestjs/common';
import { ServiceCategoryService } from './service-category.service';

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
