import { BlockMetaData } from '../../../models/block-metadata.event-model';

export class ServiceRequestStakingAmountRefundedCommand {
  public requesterId: string;
  public requestId: string;
  public stakingAmount: string;
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.requesterId = args[0];
    this.requestId = args[1];
    this.stakingAmount = args[2];
  }
}
