import { Injectable } from "@nestjs/common";
import { SubstrateService } from "../../../common";
import { setGeneticAnalysisOrderPaid } from "../../../common/polkadot-provider";

@Injectable()
export class GeneticAnalysisOrderService {
	constructor(
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