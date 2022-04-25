import { BlockMetaData } from '../../../models/block-metadata.event-model';
import { Lab } from '@debionetwork/polkadot-provider';

export class LabUnstakedCommand {
  lab: Lab;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const lab = data[0];
    this.lab = new Lab(lab.toHuman());
  }
}
