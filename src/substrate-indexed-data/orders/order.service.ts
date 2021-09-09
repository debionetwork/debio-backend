import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class OrderService {
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async getByProductNameStatusLabName(
        customer_id: string,
        product_name: string,
        status: string,
        lab_name: string,
        page: number,
        size: number,
    ) {
        const searchObj = {
          index: 'orders',
          body: {
            query: {
              bool: {
                must: [
                  { match: { 'service_info.name': product_name } },
                  { match: { 'status': status } },
                  { match: { 'lab_info.name': lab_name } },
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