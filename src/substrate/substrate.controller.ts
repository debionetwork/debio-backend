import { Body, Controller, Post, Res, Headers } from '@nestjs/common';
import { SubstrateService } from './substrate.service';
import { Response } from 'express';
import { ApiProperty } from '@nestjs/swagger';
import { RewardService } from 'src/reward/reward.service';
import { RewardDto } from 'src/reward/dto/reward.dto';

export type RegistrationRole = 'lab' | 'doctor' | 'hospital';

export class GetDbioOnRegisterDto {
  @ApiProperty({ type: String})
  accountId: string;

  @ApiProperty({ description: 'RegistrationRole'})
  role: RegistrationRole;
}

export class WalletBindingDTO {
  @ApiProperty({ type: String})
  accountId: string;

  @ApiProperty({ type: String})
  ethAddress: string;
}

@Controller('substrate')
export class SubstrateController {
  substrateService: SubstrateService;
  constructor(
    substrateService: SubstrateService,
    private rewardService: RewardService
    ) {
    this.substrateService = substrateService;
  }

  async onApplicationBootstrap() {
    this.substrateService.listenToEvents();
  }

  @Post('/wallet-binding')
  async walletBinding(
    @Body() payload: WalletBindingDTO,
    @Res() response: Response,
    @Headers('debio-api-key') debioApiKey: string,
  ) {
    if (debioApiKey != process.env.DEBIO_API_KEY) {
      return response.status(401).send('debio-api-key header is required');
    }
    const { ethAddress, accountId } = payload;
    const rewardAmount = 1

    const dataInput : RewardDto = {
      address: accountId,
      ref_number: '-',
      reward_amount: rewardAmount,
      reward_type: 'Registered User',
      currency: 'DBIO',
      created_at: new Date()
    }
    let gotRewardWording = ''
    
    let substrateAddress =
      await this.substrateService.getSubstrateAddressByEthAddress(ethAddress);

    // If user has not bound wallet before, send them 1 DBIO
    if (substrateAddress == '') {
<<<<<<< HEAD
      await this.substrateService.sendReward(accountId, rewardAmount)
      await this.rewardService.insert(dataInput)
      gotRewardWording = ` And Got Reward ${rewardAmount} DBIO`
    }
    
    await this.substrateService.bindEthAddressToSubstrateAddress(
      ethAddress,
      accountId,
      );
=======
      await this.substrateService.sendReward(accountId, 0.01)
      await this.rewardService.insert(dataInput)
      gotRewardWording = ` And Got Reward 0.01 DBIO`

      await this.substrateService.bindEthAddressToSubstrateAddress(
        ethAddress,
        accountId,
        );
      
      substrateAddress = await this.substrateService.getSubstrateAddressByEthAddress(ethAddress);
    } else {
      await this.substrateService.bindEthAddressToSubstrateAddress(
        ethAddress,
        accountId,
        );
    }
>>>>>>> c4c19507df93da0708735de1c3bea6ff09cd53dd

    return response
      .status(200)
      .send(`eth-address ${ethAddress} bound to ${substrateAddress} ${gotRewardWording}`);
  }
}
