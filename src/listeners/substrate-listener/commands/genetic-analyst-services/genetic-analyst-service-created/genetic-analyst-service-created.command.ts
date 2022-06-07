import { BlockMetaData } from '../../../models/block-metadata.event-model';
import { GeneticAnalystService } from '@debionetwork/polkadot-provider';

export class GeneticAnalystServiceCreatedCommand {
  geneticAnalystService: GeneticAnalystService;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const geneticAnalystServiceData = data[0];
    this.geneticAnalystService = new GeneticAnalystService(
      geneticAnalystServiceData.toHuman(),
    );
  }
}
