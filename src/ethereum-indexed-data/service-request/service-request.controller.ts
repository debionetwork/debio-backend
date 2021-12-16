import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiParam, ApiQuery } from '@nestjs/swagger';
import { ServiceRequestService } from './service-request.service';

@Controller('service-requests')
export class ServiceRequestController {
  constructor(readonly serviceRequestService: ServiceRequestService) {}

  @Get('/countries')
  async getAggregatedByCountries(): Promise<any> {
    const serviceRequests =
      await this.serviceRequestService.getAggregatedByCountries();
    return serviceRequests;
  }

  @Get('/customer/:customerId')
  @ApiParam({ name: 'customerId' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'size', required: false })
  async getServiceRequestByCustomer(
    @Param('customerId') customerId,
    @Query('page') page,
    @Query('size') size,
  ) {
    const requestServiceByCustomer =
      await this.serviceRequestService.getByCustomerId(
        customerId,
        Number(page),
        Number(size)
      );
    return requestServiceByCustomer;
  }

  @Get('/provideRequestService')
  @ApiQuery({ name: 'countryCode' })
  @ApiQuery({ name: 'regionCode' })
  @ApiQuery({ name: 'city' })
  @ApiQuery({ name: 'category' })
  async getCustomerProvidedService(
    @Query('countryCode') countryCode,
    @Query('regionCode') regionCode,
    @Query('city') city,
    @Query('category') category,
  ) {
    const requestServiceByCustomer =
      await this.serviceRequestService.provideRequestService(
        countryCode,
        regionCode,
        city,
        category,
      );
    return requestServiceByCustomer;
  }
}
