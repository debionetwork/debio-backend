import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { SentryInterceptor } from '../../../common/interceptors';
import { ServiceService } from './service.service';

@UseInterceptors(SentryInterceptor)
@Controller('services')
export class ServiceController {
  constructor(readonly serviceService: ServiceService) {}

  @Get(':country/:city')
  @ApiParam({ name: 'country' })
  @ApiParam({ name: 'city' })
  async findByCountryCity(@Param() params): Promise<any> {
    const services = await this.serviceService.getByCountryCity(
      params.country,
      params.city,
    );
    return services;
  }
}
