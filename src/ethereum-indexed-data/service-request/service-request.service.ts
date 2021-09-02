import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import dummyData from './dummy-data';

@Injectable()
export class ServiceRequestService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async getAggregatedByCountries() {
    return dummyData;
    // const serviceRequests = await this.elasticsearchService.search({
    //   index: 'service-request',
    //   body: {},
    // });
    // return serviceRequests;
  }
}
