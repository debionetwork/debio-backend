import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class ServiceService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async getByCountryCity(country: string, city: string) {
    const services = await this.elasticsearchService.search({
      index: 'services',
      body: {
        query: {
          bool: {
            filter: [{ match: { country } }, { match: { city } }],
          },
        },
      },
    });
    return services;
  }
}
