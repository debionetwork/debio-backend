import { BlockMetaData } from '../../../models/block-metadata.event-model';
import { GeneticAnalyst } from '../../../../../common';

export class GeneticAnalystVerificationStatusCommand {
  geneticAnalyst: GeneticAnalyst;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const geneticAnalystData = data[0];
    this.geneticAnalyst = new GeneticAnalyst(geneticAnalystData.toHuman());
  }
}
