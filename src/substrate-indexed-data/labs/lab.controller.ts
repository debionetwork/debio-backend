import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { LabService } from './lab.service';

@Controller('labs')
export class LabController {
  constructor(readonly labService: LabService) {}

  // host/{country}/{city}/{category}?page=1&size=20
  @Get(':country/:city/:category')
  async findByCountryCityCategory(
    @Param() params,
    @Query('page') page,
    @Query('size') size,
  ): Promise<any> {
    const services = await this.labService.getByCountryCityCategory(
      params.country,
      params.city,
      params.category,
      page,
      size,
    );
    return services;
  }
}
