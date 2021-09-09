import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class OrderService {
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async getByProductNameStatusLabName(
        customer_id: string,
        query: string,
        page: number,
        size: number,
    ) {
        const searchObj = {
          index: 'orders',
          body: {
            query: {
              bool: {
                filter: [
                  {
                    bool: {
                      should: [
                        { wildcard : { 'service_info.name': `*${query}*` } },
                        { wildcard : { 'status': `*${query}*` } },
                        { wildcard : { 'lab_info.name': `*${query}*` } },
                      ]
                    }
                  },
                  {
                    bool: {
                      must: [
                        { match: { 'customer_id': customer_id }}
                      ]
                    }
                  }
                ],
              }
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