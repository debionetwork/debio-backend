import { BlockMetaData } from '../../../models/block-metadata.event-model';
import { GeneticAnalysisOrder } from '@debionetwork/polkadot-provider';

export class GeneticAnalysisOrderPaidCommand {
  geneticAnalysisOrders: GeneticAnalysisOrder;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const geneticAnalysisOrderData = data[0];
    this.geneticAnalysisOrders = new GeneticAnalysisOrder(
      geneticAnalysisOrderData.toHuman(),
    );
  }
}
