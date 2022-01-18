import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  convertToDbioUnitString,
  DebioConversionService,
  RewardService,
  sendRewards,
  SubstrateService,
} from '../../../../../common';
import { DataStakedCommand } from './data-staked.command';
import { ethers } from 'ethers';
import { RewardDto } from '../../../../../common/modules/reward/dto/reward.dto';

@Injectable()
@CommandHandler(DataStakedCommand)
export class DataStakedHandler implements ICommandHandler<DataStakedCommand> {
  constructor(
    private readonly rewardService: RewardService,
    private readonly exchangeCacheService: DebioConversionService,
    private readonly substrateService: SubstrateService,
  ) {}

  async execute(command: DataStakedCommand) {
    const dataStaked = command.dataStaked;
    const dataOrder = await (
      await this.substrateService.api.query.orders.orders(dataStaked.orderId)
    ).toJSON();

    const debioToDai = Number(
      (await this.exchangeCacheService.getExchange())['dbioToDai'],
    );
    const rewardPrice = dataOrder['price'][0].value * debioToDai;

    //send reward
    await sendRewards(
      this.substrateService.api,
      this.substrateService.pair,
      dataOrder['customer_id'],
      convertToDbioUnitString(rewardPrice),
    );

    // Write Logging Reward Customer Staking Request Service
    const dataCustomerLoggingInput: RewardDto = {
      address: dataOrder['customerId'],
      ref_number: dataOrder['id'],
      reward_amount: rewardPrice,
      reward_type: 'Customer Add Data as Bounty',
      currency: 'DBIO',
      created_at: new Date(),
    };
    await this.rewardService.insert(dataCustomerLoggingInput);
  }
}
