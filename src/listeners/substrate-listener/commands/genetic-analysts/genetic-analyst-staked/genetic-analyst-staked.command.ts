import { BlockMetaData } from '../../../models/block-metadata.event-model';
import { GeneticAnalyst } from '../../../../../common';

export class GeneticAnalystStakedCommand {
  geneticAnalyst: GeneticAnalyst;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const geneticAnalyst = data[0];
    this.geneticAnalyst = new GeneticAnalyst(geneticAnalyst.toHuman());
  }
}
