import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SentryInterceptor } from '../../../common';
import { EmrService } from './emr.service';
import { emrCategories } from './models/response';

@UseInterceptors(SentryInterceptor)
@Controller('emr-category')
export class EmrController {
  constructor(private readonly emrService: EmrService) {}

  @Get()
  @ApiOperation({description: 'get categories of electronic medical record'})
  @ApiResponse({
    status: 200,
    schema: {
      example: emrCategories
    }
  })
  getCategory() {
    try {
      return this.emrService.getAll();
    } catch (error) {
      console.log(error);
    }
  }
}
