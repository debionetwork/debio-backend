import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class OrderService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async getOrderByHashId(
    hashId: string) {
      const order = await this.elasticsearchService.search({
        index: 'orders',
        body: {
          query: {
            match: {
              _id: {
                query: hashId
              }
            }
          }
        }
      })

      const hitsOrder = order.body.hits.hits;

      return hitsOrder.length > 0 ? hitsOrder[0]._source : null;
  }

  async getOrderList(
    customerId: string,
    keyword: string,
    page: number,
    size: number,
  ) {
    const filterArray = [];

    filterArray.push({
      bool: {
        must: [
          { match: { customerId: customerId } }
        ],
      },
    });

    if (keyword && keyword.trim() !== "") {
      filterArray.push({
        bool: {
          should: [
            { match_phrase_prefix: { status: { query: keyword } } },
            { match_phrase_prefix: { dnaSampleTrackingId: { query: keyword } } },
            { match_phrase_prefix: { 'serviceInfo.name': { query: keyword } } },
            { match_phrase_prefix: { 'labInfo.name': { query: keyword } } },
          ],
        },
      });
    }
    
    const query = {
      bool: {
        filter: filterArray,
      },
    };

    const searchObj = {
      index: 'orders',
      body: {
        query: query,
        sort: [
          {
            "createdAt.keyword": {
              unmappedType: "keyword",
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

    const totalOrders = await this.elasticsearchService.count({
      index: 'orders',
      body: {
        query: query,
      },
    });

    const orders = await this.elasticsearchService.search(searchObj);

    return {
      info: {
        page: page,
        count: totalOrders.body.count,
      },
      data: orders.body.hits.hits,
    };
  }

  async getBountyList(
    customerId: string,
    keyword: string,
    page: number,
    size: number,
  ) {
    const filterArray = [];

    filterArray.push({
      bool: {
        must: [
          { match: { customerId: customerId } },
          { match: { bounty: true } }
        ],
      },
    });

    if (keyword && keyword.trim() !== "") {
      filterArray.push({
        bool: {
          should: [
            { match_phrase_prefix: { status: { query: keyword } } },
            { match_phrase_prefix: { dnaSampleTrackingId: { query: keyword } } },
            { match_phrase_prefix: { 'serviceInfo.name': { query: keyword } } },
            { match_phrase_prefix: { 'labInfo.name': { query: keyword } } },
          ],
        },
      });
    }
    
    const query = {
      bool: {
        filter: filterArray,
      },
    };

    const searchObj = {
      index: 'orders',
      body: {
        query: query,
        sort: [
          {
            "createdAt.keyword": {
              unmappedType: "keyword",
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

    const totalOrders = await this.elasticsearchService.count({
      index: 'orders',
      body: {
        query: query,
      },
    });

    const orders = await this.elasticsearchService.search(searchObj);

    return {
      info: {
        page: page,
        count: totalOrders.body.count,
      },
      data: orders.body.hits.hits,
    };
  }
}
