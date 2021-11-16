import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
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
  @ApiParam({ name: 'customerId'})
  @ApiParam({ name: 'page', required: false})
  @ApiParam({ name: 'size', required: false})
  async getServiceRequestByCustomer(
    @Param('customerId') customerId,
    @Query('page') page,
    @Query('size') size,
  ) {
    const requestServiceByCustomer = await this.serviceRequestService.getByCustomerId(
      customerId,
      page,
      size
    )
    return requestServiceByCustomer;
  }
}
