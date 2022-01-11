import { ServiceRequest } from "../../../../../common";
import { BlockMetaData } from "../../../models/block-metadata.event-model";

export class ServiceRequestUnstakedCommand {
  request: ServiceRequest;
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const requestData = args[1];
    this.request = new ServiceRequest(requestData.toHuman());
  }
}