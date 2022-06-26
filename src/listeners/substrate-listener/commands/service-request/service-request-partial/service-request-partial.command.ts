import { BlockMetaData } from '../../../models/block-metadata.event-model';
import { ServiceRequest } from '@debionetwork/polkadot-provider';

export class ServiceRequestStakingAmountIncreasedCommand {
  requesterId: string;
  requestId: string;
  additionalStakingAmount: string;
  constructor(args: Array<any>, public readonly blockMetadata: BlockMetaData) {
    this.requesterId = args[0].toString();
    this.requestId = args[1].toString();
    this.additionalStakingAmount = args[2].toString();
  }
}
