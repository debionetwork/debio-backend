import { Injectable, Logger } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";

@Injectable()
export class GeneticAnalysisService {
  private readonly logger: Logger = new Logger(GeneticAnalysisService.name);
  constructor(private readonly elasticSearchService: ElasticsearchService) {}

  async getGeneticAnalysByTrackingId(genetic_analyst_tracking_id: string) {
    let hitsGeneticAnalys = [];

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
      hitsGeneticAnalys = geneticAnalysis.body.hits.hits;
    } catch (error) {
      if (error?.body?.error?.type === 'index_not_found_exception') {
        await this.logger.log(
          `API "genetic-analysis/{tracking_id}": ${error.body.error.reason}`,
        );
      } else {
        throw error;
      }
    }
    return hitsGeneticAnalys.length > 0 ? hitsGeneticAnalys[0]._source: {};
  }
}