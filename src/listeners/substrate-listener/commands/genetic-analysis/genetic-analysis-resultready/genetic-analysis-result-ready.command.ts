import { BlockMetaData } from '../../../models/block-metadata.event-model';
import { GeneticAnalysis } from '@debionetwork/polkadot-provider';

export class GeneticAnalysisResultReadyCommand {
  geneticAnalysis: GeneticAnalysis;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const geneticAnalysisData = data[0];
    this.geneticAnalysis = new GeneticAnalysis(geneticAnalysisData.toHuman());
  }
}
