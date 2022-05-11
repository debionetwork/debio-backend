import { BlockMetaData } from '../../../models/block-metadata.event-model';
import { Lab } from '@debionetwork/polkadot-provider';

export class LabRegisteredCommand {
  lab: Lab;
  constructor(args: Array<any>, public readonly blockMetadata: BlockMetaData) {
    const labData = args[0];
    this.lab = new Lab(labData.toHuman());
  }
}
