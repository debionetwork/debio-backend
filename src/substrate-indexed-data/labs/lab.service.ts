import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class LabService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async getByCountryCityCategory(
    country: string,
    city: string,
    category: string,
    page: number,
    size: number,
  ) {
    
    const searchObj = {
      index: 'labs',
      body: {
        query: {
          bool: {
            must: [
              { match_phrase_prefix: { 'services.country': { query: country } } },
              { match_phrase_prefix: { 'services.city': { query: city } } },
              { match_phrase_prefix: { 'services.info.category': { query: category } } },
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

    const labs = await this.elasticsearchService.search(searchObj);
    return labs;
  }
}
