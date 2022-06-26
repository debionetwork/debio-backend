import { BlockMetaData } from '../../../models/block-metadata.event-model';

export class ServiceRequestStakingAmountExcessRefundedCommand {
  requesterId: string;
  requestId: string;
  additionalStakingAmount: string;
  constructor(args: Array<any>, public readonly blockMetadata: BlockMetaData) {
    this.requesterId = args[0].toString();
    this.requestId = args[1].toString();
    this.additionalStakingAmount = args[2].toString();
  }
}
