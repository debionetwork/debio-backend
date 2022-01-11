import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { SentryInterceptor } from '../../../common/interceptors';
import { LabService } from '../services/lab.service';

@UseInterceptors(SentryInterceptor)
@Controller('labs')
export class LabController {
  constructor(readonly labService: LabService) {}

  // host/{country}/{city}/{category}?page=1&size=20
  @Get()
  @ApiQuery({ name: 'country' })
  @ApiQuery({ name: 'region' })
  @ApiQuery({ name: 'city' })
  @ApiQuery({ name: 'category' })
  @ApiQuery({
    name: 'service_flow',
    enum: ['RequestTest', 'StakingRequestService'],
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  async findByCountryCityCategory(
    @Query('country') country,
    @Query('region') region,
    @Query('city') city,
    @Query('category') category,
    @Query('service_flow') service_flow: boolean,
    @Query('page') page,
    @Query('size') size,
  ): Promise<any> {
    const services = await this.labService.getByCountryCityCategory(
      country,
      region,
      city,
      category,
      service_flow,
      Number(page),
      Number(size),
    );
    return services;
  }
}
