import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class ServiceService {
  private readonly logger : Logger = new Logger(ServiceService.name)
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async getByCountryCity(country: string, city: string) {
    let result = []
    try {
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
      result = services.body.hits.hits
    } catch (error) {
      if (error.body.error.type === 'index_not_found_exception') {
        await this.logger.log(`API "services/{country}/{city}":' ${error.body.error.reason}`);
      } else {
        throw error
      }
    }
    return result;
  }
}
