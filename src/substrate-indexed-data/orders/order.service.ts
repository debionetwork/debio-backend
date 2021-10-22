import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class OrderService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async getOrderByHashId(
    hash_id: string) {
      const order = await this.elasticsearchService.search({
        index: 'orders',
        body: {
          query: {
            match: {
              _id: {
                query: hash_id
              }
            }
          }
        }
      })

      return order.body.hits.hits[0]._source;
  }

  async getOrderList(
    customer_id: string,
    keyword: string,
    page: number,
    size: number,
  ) {
    const filter_array = [];

    filter_array.push({
      bool: {
        must: [
          { match: { customer_id: customer_id } }
        ],
      },
    });

    if (keyword && keyword.trim() !== "") {
      filter_array.push({
        bool: {
          should: [
            { match_phrase_prefix: { status: { query: keyword } } },
            { match_phrase_prefix: { dna_sample_tracking_id: { query: keyword } } },
            { match_phrase_prefix: { 'service_info.name': { query: keyword } } },
            { match_phrase_prefix: { 'lab_info.name': { query: keyword } } },
          ],
        },
      });
    }
    
    const query = {
      bool: {
        filter: filter_array,
      },
    };

    const searchObj = {
      index: 'orders',
      body: {
        query: query,
        sort: [
          {
            "created_at.keyword": {
              unmapped_type: "keyword",
              order: "desc"
            }
          }
        ]
      },
      from: 0,
      size: 10000,
    };

    if (page) {
      const _size = size ? size : 10;
      const from = (page - 1) * _size;

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
      data: orders.body.hits.hits,
    };
  }
}
