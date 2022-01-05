import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { SentryInterceptor } from '../../../common';
import { EmrService } from './emr.service';

@UseInterceptors(SentryInterceptor)
@Controller('emr-category')
export class EmrController {
  constructor(private readonly emrService: EmrService) {}

  @Get()
  getCategory() {
    try {
      return this.emrService.getAll();
    } catch (error) {
      console.log(error);
    }
  }
}
