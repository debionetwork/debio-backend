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

  @Post('/get-dbio-pre-register')
  async getDbioPreRegister(
    @Body() payload: GetDbioOnRegisterDto,
    @Res() response: Response,
  ) {
    const { accountId, role } = payload;
    if (!accountId) {
      return response.status(400).send('accountId is required');
    }
    if (['lab', 'doctor', 'hospital'].includes(role) == false) {
      return response.status(400).send('role not found');
    }
    try {
      const hasRole = await this.substrateService.hasRole(accountId, role);
      if (hasRole) {
        return response.status(208).send('User has already registered');
      }
      await this.substrateService.sendDbioFromFaucet(
        accountId,
        '1000000000000000000',
      );
      return response.status(200).send(`1 DBIO sent to ${accountId}`);
    } catch (err) {
      return response.status(500);
    }
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

    const dataInput : RewardDto = {
      address: accountId,
      ref_number: '-',
      reward_amount: 0.01,
      reward_type: 'Register User',
      currency: 'DBIO',
      create_at: new Date()
    }
    let gotRewardWording = ''
    
    const substrateAddress =
      await this.substrateService.getSubstrateAddressByEthAddress(ethAddress);

    // If user has not bound wallet before, send them 1 DBIO
    if (substrateAddress == '') {
      await this.rewardService.sendReward(accountId, 0.01)
      await this.rewardService.insert(dataInput)

      gotRewardWording = ` And Got Reward 0.01 DBIO`
    }

    await this.substrateService.bindEthAddressToSubstrateAddress(
      ethAddress,
      accountId,
    );

    return response
      .status(200)
      .send(`eth-address ${ethAddress} bound to ${substrateAddress} ${gotRewardWording}`);
  }
}
