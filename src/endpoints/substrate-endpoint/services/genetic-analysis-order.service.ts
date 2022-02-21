import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SubstrateService } from '../../../common';
import { setGeneticAnalysisOrderPaid } from '../../../common/polkadot-provider';

@Injectable()
export class GeneticAnalysisOrderService {
  private readonly logger: Logger = new Logger(
    GeneticAnalysisOrderService.name,
  );
  constructor(
    private readonly elasticSearchService: ElasticsearchService,
    private readonly substrateService: SubstrateService,
  ) {}

  async geneticAnalysisSetOrderPaid(genetic_analyst_order_id: string) {
    try {
      await setGeneticAnalysisOrderPaid(
        this.substrateService.api,
        this.substrateService.pair,
        genetic_analyst_order_id,
      );
    } catch (error) {
      throw error;
    }
  }

  async getGeneticAnalysisOrderList(
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
      case 'analyst':
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
                genetic_analysis_tracking_id: {
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
      index: 'genetic-analysis-order',
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
          index: 'genetic-analysis-order',
          body: {
            query: query,
          },
        });

      const genetic_analysis_orders = await this.elasticSearchService.search(
        searchObj,
      );
      count = total_genetic_analysis_orders;
      data = genetic_analysis_orders.body.hits.hits;
    } catch (error) {
      if (error?.body?.error?.type === 'index_not_found_exception') {
        await this.logger.log(
          `API "genetic-anaysis-orders/list/${type}/{${type}Id}": ${error.body.error.reason}`,
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
