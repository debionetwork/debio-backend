import { BlockMetaData } from '../../../models/block-metadata.event-model';
import { ServiceRequest } from '../../../../../common';

export class ServiceRequestCreatedCommand {
  request: ServiceRequest;
  constructor(args: Array<any>, public readonly blockMetadata: BlockMetaData) {
    const requestData = args[1];
    this.request = new ServiceRequest(requestData.toHuman());
  }
}
