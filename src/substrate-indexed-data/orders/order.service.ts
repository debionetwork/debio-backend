import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class OrderService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async getByProductNameStatusLabName(
    customer_id: string,
    keyword: string,
    page: number,
    size: number,
  ) {
    const query = {
      bool: {
        filter: [
          {
            bool: {
              should: [
                { wildcard: { 'service_info.name': `*${keyword}*` } },
                { wildcard: { status: `*${keyword}*` } },
                { wildcard: { 'lab_info.name': `*${keyword}*` } },
              ],
            },
          },
          {
            bool: {
              must: [{ match: { customer_id: customer_id } }],
            },
          },
        ],
      },
    };

    const searchObj = {
      index: 'orders',
      body: {
        query: query,
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

    const total_orders = await this.elasticsearchService.count({
      index: 'orders',
      body: {
        query: query,
      },
    });

    const orders = await this.elasticsearchService.search(searchObj);

    return {
      info: {
        page: page,
        count: total_orders.body.count,
      },
      data: orders,
    };
  }
}
