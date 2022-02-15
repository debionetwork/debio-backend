import { Injectable, Logger } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { SubstrateService } from "../../../common";
import { setGeneticAnalysisOrderPaid } from "../../../common/polkadot-provider";

@Injectable()
export class GeneticAnalysisOrderService {
	private readonly logger: Logger = new Logger(GeneticAnalysisOrderService.name);
	constructor(
		private readonly elasticSearchService: ElasticsearchService,
		private readonly substrateService: SubstrateService
	) {}

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