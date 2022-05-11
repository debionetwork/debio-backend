import { Lab } from '@debionetwork/polkadot-provider';
import { BlockMetaData } from '../../../models/block-metadata.event-model';

export class LabStakeSuccessfulCommand {
  labs: Lab;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const labData = data[0];
    this.labs = new Lab(labData.toHuman());
  }
}
