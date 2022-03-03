import { BlockMetaData } from '../../../models/block-metadata.event-model';
import { GeneticAnalystOrder } from '@debionetwork/polkadot-provider';

export class GeneticAnalysisOrderCreatedCommand {
  geneticAnalysisOrders: GeneticAnalystOrder;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const geneticAnalysisOrderData = data[0];
    this.geneticAnalysisOrders = new GeneticAnalystOrder(
      geneticAnalysisOrderData.toHuman(),
    );
  }
}
