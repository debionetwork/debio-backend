import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SentryInterceptor } from '../../../common';
import { serviceCategories } from './models/response';
import { ServiceCategoryService } from './service-category.service';

@UseInterceptors(SentryInterceptor)
@Controller('service-category')
export class ServiceCategoryController {
  constructor(
    private readonly serviceCategoryService: ServiceCategoryService,
  ) {}

  @Get()
  @ApiOperation({description: 'get categories of lab service.'})
  @ApiResponse({
    status: 200,
    schema: {
      example: serviceCategories
    }
  })
  getServiceCategory() {
    return this.serviceCategoryService.getAll();
  }
}
