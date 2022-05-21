import { BlockMetaData } from '../../../models/block-metadata.event-model';
import { ServiceRequest } from '@debionetwork/polkadot-provider';

export class ServiceRequestStakingAmountIncreasesdCommand {
  request: any;
  constructor(args: Array<any>, public readonly blockMetadata: BlockMetaData) {
    const requestData = args;
    this.request = new ServiceRequest(requestData);
  }
}
