import { Lab } from '@debionetwork/polkadot-provider';
import { BlockMetaData } from '../../../models/block-metadata.event-model';

export class LabRetrieveUnstakeAmountCommand {
  lab: Lab;
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const labData = args[0];
    this.lab = new Lab(labData.toHuman());
  }
}
