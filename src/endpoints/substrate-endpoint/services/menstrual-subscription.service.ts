import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class MenstrualSubscriptionService {
  private readonly logger: Logger = new Logger(
    MenstrualSubscriptionService.name,
  );
  constructor(private readonly elasticSearchService: ElasticsearchService) {}

  async getMenstrualSubscriptionDetail(hash_id: string) {
    try {
      const menstrualSubscription = await this.elasticSearchService.search({
        index: 'menstrual-subscription',
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
      const hits = menstrualSubscription.body.hits.hits || [];

      return hits.length > 0 ? hits[0]._source : {};
    } catch (error) {
      if (error?.body?.error?.type === 'index_not_found_exception') {
        await this.logger.log(
          `API "menstrualsubscription/{hash_id}": ${error.body.error.reason}`,
        );
      } else {
        throw error;
      }
    }
  }

  public async getMenstrualSubscriptionList(
    hash_id: string,
    keyword: string,
    page: number,
    size: number,
  ) {
    const filter_array = [];

    const match = { address_id: hash_id };

    filter_array.push({
      bool: {
        must: [{ match: match }],
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
                payment_status: {
                  payment_status: keyword,
                },
              },
            },
            {
              match_phrase_prefix: {
                currency: {
                  query: keyword,
                },
              },
            },
            {
              match_phrase_prefix: {
                duration: {
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
      index: 'menstrual-subscription',
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
      const total_genetic_analysis_orders =
        await this.elasticSearchService.count({
          index: 'menstrual-subscription',
          body: {
            query: query,
          },
        });

      const genetic_analysis_orders = await this.elasticSearchService.search(
        searchObj,
      );

      count = total_genetic_analysis_orders.body.count | 0;
      data = genetic_analysis_orders.body.hits.hits;
    } catch (error) {
      if (error?.body?.error?.type === 'index_not_found_exception') {
        await this.logger.log(
          `API "menstrual/list/Id}": ${error.body.error.reason}`,
        );
      } else {
        throw error;
      }
    }

    return {
      info: {
        page: page | 1,
        count,
      },
      data,
    };
  }
}
