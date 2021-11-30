import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class LabService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async getByCountryCityCategory(
    country: string,
    region: string,
    city: string,
    category: string,
    service_flow: boolean,
    page: number,
    size: number,
  ) {
    const searchObj = {
      index: 'labs',
      body: {
        query: {
          bool: {
            must: [
              {
                match_phrase_prefix: { 'services.country': { query: country } },
              },
              { match_phrase_prefix: { 'services.region': { query: region } } },
              { match_phrase_prefix: { 'services.city': { query: city } } },
              {
                match_phrase_prefix: {
                  'services.info.category': { query: category },
                },
              },
              {
                match_phrase_prefix: {
                  'services.service_flow': { query: service_flow },
                },
              },
            ],
          },
        },
      },
      from: 0,
      size: 10,
    };

    if (page) {
      const _size = size ? size : 10;
      const from = size * page - _size;

      searchObj.from = from;
      searchObj.size = _size;
    }
    const result = [];
    const labs = await this.elasticsearchService.search(searchObj);
    labs.body.hits.hits.forEach((lab) => {
      lab._source.services = lab._source.services.filter(
        (serviceFilter) =>
          serviceFilter.info['category'] === category &&
          serviceFilter.service_flow === service_flow,
      );
      lab._source.services.forEach((labService) => {
        labService.lab_detail = lab._source.info;
        labService.certifications = lab._source.certifications;
        labService.verification_status = lab._source.verification_status;
        labService.blockMetaData = lab._source.blockMetaData;
        labService.lab_id = lab._source.account_id;
        
        result.push(labService);
      });
    });

    return { result };
  }
}
