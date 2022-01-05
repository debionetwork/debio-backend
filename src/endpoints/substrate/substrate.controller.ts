import { Body, Controller, Post, Res, Headers, UseInterceptors } from '@nestjs/common';
import { SubstrateService } from './substrate.service';
import { Response } from 'express';
import { RewardService } from '../../common/utilities/reward/reward.service';
import { RewardDto } from '../../common/utilities/reward/dto/reward.dto';
import { SentryInterceptor } from '../../common/interceptors';
import { WalletBindingDTO } from './dto/wallet-binding.dto';

@UseInterceptors(SentryInterceptor)
@Controller('substrate')
export class SubstrateController {
  constructor(
    private readonly substrateService: SubstrateService,
    private readonly rewardService: RewardService,
  ) {}

  @Post('/wallet-binding')
  async walletBinding(
    @Body() payload: WalletBindingDTO,
    @Res() response: Response,
    @Headers('debio-api-key') debioApiKey: string,
  ) {
    if (debioApiKey != process.env.DEBIO_API_KEY) {
      return response.status(401).send('debio-api-key header is required');
    }
    const { accountId, ethAddress } = payload;
    const rewardAmount = 0.2;

    const dataInput: RewardDto = {
      address: accountId,
      ref_number: '-',
      reward_amount: rewardAmount,
      reward_type: 'Registered User',
      currency: 'DBIO',
      created_at: new Date(),
    };
    let reward = null;
    let isSubstrateAddressHasBeenBinding =
      await this.substrateService.getSubstrateAddressByEthAddress(ethAddress);
      
    const bindingEth = await this.substrateService.bindEthAddressToSubstrateAddress(
      ethAddress,
      accountId,
    );      
    
    if (!bindingEth) {
      response.status(401).send('Binding Error');
    }

    const isRewardHasBeenSend = await this.rewardService.getRewardBindingByAccountId(accountId)
    
    if(!isSubstrateAddressHasBeenBinding && !isRewardHasBeenSend){
      await this.substrateService.sendReward(accountId, rewardAmount);
      reward = rewardAmount
      await this.rewardService.insert(dataInput);
    }
    
    return response
      .status(200)
      .send({
        reward,
        message :`eth-address ${ethAddress} bound to ${accountId}`
      });
  }
}
