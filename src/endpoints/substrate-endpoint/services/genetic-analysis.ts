import { Injectable, Logger } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { setGeneticAnalysisOrderPaid } from "../../../../src/common/polkadot-provider/command/genetic-analysis-order";
import { SubstrateService } from "../../../../src/common";

@Injectable()
export class GeneticAnalysisService {
  private readonly logger: Logger = new Logger(GeneticAnalysisService.name);
  constructor(
    private readonly elasticSearchService: ElasticsearchService,
    private readonly substrateService: SubstrateService,
    ) {}

  async getGeneticAnalysisByTrackingId(genetic_analyst_tracking_id: string) {
    let hitsGeneticAnalysis = [];

    try {
      const geneticAnalysis = await this.elasticSearchService.search({
        index: 'genetic-analysis',
        body: {
          query: {
            match: {
              genetic_analyst_tracking_id: {
                query: genetic_analyst_tracking_id,
              },
            },
          },
        },
      });
      hitsGeneticAnalysis = geneticAnalysis.body.hits.hits;
    } catch (error) {
      if (error?.body?.error?.type !== 'index_not_found_exception') {
        throw error;
      }
      await this.logger.log(
        `API "genetic-analysis/{tracking_id}": ${error.body.error.reason}`,
      );
    }
    return hitsGeneticAnalysis.length > 0 ? hitsGeneticAnalysis[0]._source: {};
  }

  async geneticAnalysisSetOrderPaid(genetic_analyst_order_id: string){
    try {
      await setGeneticAnalysisOrderPaid(
        this.substrateService.api,
        this.substrateService.pair,
        genetic_analyst_order_id
      )
    } catch (error) {
      throw error;
    }
    
  }
}