import { BlockMetaData } from '../../../models/block-metadata.event-model';

export class RewardFundsCommand {
  rewards: any;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const rewardData = {
      accountId: data[0].toHuman(),
      amount: data[1].toHuman(),
      blockNumber: data[2].toHuman(),
    };
    this.rewards = rewardData;
  }
}
