import { Controller, Get } from '@nestjs/common';
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
}
