import { BlockMetaData } from '../../../models/block-metadata.event-model';
import { ServiceRequest } from '@debionetwork/polkadot-provider';

export class ServiceRequestClaimedCommand {
  request: ServiceRequest;
  constructor(args: Array<any>, public readonly blockMetadata: BlockMetaData) {
    const requestData = args[1];
    this.request = new ServiceRequest(requestData.toHuman());
  }
}
