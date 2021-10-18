import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ApiParam, ApiQuery } from '@nestjs/swagger';
import { LabService } from './lab.service';

@Controller('labs')
export class LabController {
  constructor(readonly labService: LabService) {}

  // host/{country}/{city}/{category}?page=1&size=20
  @Get(':country/:city/:category')
  @ApiParam({ name: 'country'})
  @ApiParam({ name: 'city'})
  @ApiParam({ name: 'category'})
  @ApiQuery({ name: 'page', required: false})
  @ApiQuery({ name: 'size', required: false})
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
