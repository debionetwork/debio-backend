import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class OrderService {
  private readonly logger: Logger = new Logger(OrderService.name);
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async getOrderByHashId(hash_id: string) {
    let hits_order = [];
    try {
      const order = await this.elasticsearchService.search({
        index: 'orders',
        body: {
          query: {
            match: {
              _id: {
                query: hash_id,
              },
            },
          },
        },
      });
      hits_order = order.body.hits.hits;
    } catch (error) {
      if (error?.body?.error?.type === 'index_not_found_exception') {
        await this.logger.log(
          `API "orders/{hash_id}": ${error.body.error.reason}`,
        );
      } else {
        throw error;
      }
    }
    return hits_order.length > 0 ? hits_order[0]._source : {};
  }

  async getOrderList(
    type: string,
    hash_id: string,
    keyword: string,
    page: number,
    size: number,
  ) {
    const filter_array = [];

    let match;
    const mustNot = [];
    switch (type) {
      case 'customer':
        match = { customer_id: hash_id };
        break;
      case 'lab':
        match = { seller_id: hash_id };

        mustNot.push({
          match: { status: { query: 'Unpaid' } },
        });

        mustNot.push({
          match: { status: { query: 'Cancelled' } },
        });
        break;
      default:
        match = { customer_id: hash_id };
        break;
    }

    filter_array.push({
      bool: {
        must: [{ match: match }],
        must_not: mustNot,
      },
    });

    if (keyword && keyword.trim() !== '') {
      filter_array.push({
        bool: {
          should: [
            {
              match_phrase_prefix: {
                status: {
                  query: keyword,
                },
              },
            },
            {
              match_phrase_prefix: {
                dna_sample_tracking_id: {
                  query: keyword,
                },
              },
            },
            {
              match_phrase_prefix: {
                'service_info.name': {
                  query: keyword,
                },
              },
            },
            {
              match_phrase_prefix: {
                'lab_info.name': {
                  query: keyword,
                },
              },
            },
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
            'created_at.keyword': {
              unmapped_type: 'keyword',
              order: 'desc',
            },
          },
        ],
      },
      from: size * page - size || 0,
      size: size || 10,
    };

    let count = null;
    let data = [];

    try {
      const total_orders = await this.elasticsearchService.count({
        index: 'orders',
        body: {
          query: query,
        },
      });

      const orders = await this.elasticsearchService.search(searchObj);
      count = total_orders;
      data = orders.body.hits.hits;
    } catch (error) {
      if (error?.body?.error?.type === 'index_not_found_exception') {
        await this.logger.log(
          `API "orders/list/{customerId}": ${error.body.error.reason}`,
        );
      } else {
        throw error;
      }
    }

    return {
      info: {
        page: page,
        count,
      },
      data,
    };
  }

  async getBountyList(
    customer_id: string,
    keyword: string,
    page: number,
    size: number,
  ) {
    const filter_array = [];

    filter_array.push({
      bool: {
        must: [
          { match: { customer_id: customer_id } },
          { match: { bounty: true } },
        ],
      },
    });

    if (keyword && keyword.trim() !== '') {
      filter_array.push({
        bool: {
          should: [
            {
              match_phrase_prefix: {
                status: {
                  query: keyword,
                },
              },
            },
            {
              match_phrase_prefix: {
                dna_sample_tracking_id: {
                  query: keyword,
                },
              },
            },
            {
              match_phrase_prefix: {
                'service_info.name': {
                  query: keyword,
                },
              },
            },
            {
              match_phrase_prefix: {
                'lab_info.name': {
                  query: keyword,
                },
              },
            },
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
            'created_at.keyword': {
              unmapped_type: 'keyword',
              order: 'desc',
            },
          },
        ],
      },
      from: size * page - size || 0,
      size: size || 10,
    };

    let count = null;
    let data = [];

    try {
      const total_orders = await this.elasticsearchService.count({
        index: 'orders',
        body: {
          query: query,
        },
      });

      const orders = await this.elasticsearchService.search(searchObj);
      count = total_orders.body.count;
      data = orders.body.hits.hits;
    } catch (error) {
      if (error?.body?.error?.type === 'index_not_found_exception') {
        await this.logger.log(
          `API "bounty_list/{customer_id}": ${error.body.error.reason}`,
        );
      } else {
        throw error;
      }
    }

    return {
      info: {
        page: page,
        count,
      },
      data,
    };
  }
}
