import { Injectable } from '@nestjs/common';
import { RewardDto } from '../../common/modules/reward/dto/reward.dto';
import { RewardService } from '../../common/modules/reward/reward.service';
import { DateTimeProxy, SubstrateService } from '../../common';
import {
  updateGeneticAnalystVerificationStatus,
  convertToDbioUnitString,
  LabVerificationStatus,
  sendRewards,
  updateLabVerificationStatus,
  GeneticAnalystsVerificationStatus,
} from '@debionetwork/polkadot-provider';

@Injectable()
export class VerificationService {
  constructor(
    private readonly dateTimeProxy: DateTimeProxy,
    private readonly subtrateService: SubstrateService,
    private readonly rewardService: RewardService,
  ) {}

  async vericationLab(substrateAddress: string, verificationStatus: string) {
    // Update Status Lab to Verified
    const updateLabVerificationStatusPromise = new Promise(
      // eslint-disable-next-line
      (resolve, _reject) => {
        updateLabVerificationStatus(
          this.subtrateService.api as any,
          this.subtrateService.pair,
          substrateAddress,
          <LabVerificationStatus>verificationStatus,
          () => resolve('resolved'),
        );
      },
    );
    await updateLabVerificationStatusPromise;

    //Send Reward 2 DBIO
    if (verificationStatus === 'Verified') {
      const reward = 2;
      // eslint-disable-next-line
      const sendRewardsPromise = new Promise((resolve, _reject) => {
        sendRewards(
          this.subtrateService.api as any,
          this.subtrateService.pair,
          substrateAddress,
          convertToDbioUnitString(reward),
          () => resolve('resolved'),
        );
      });
      await sendRewardsPromise;
    }

    //Write to Reward Logging
    const dataInput: RewardDto = {
      address: substrateAddress,
      ref_number: '-',
      reward_amount: 2,
      reward_type: 'Lab Verified',
      currency: 'DBIO',
      created_at: new Date(this.dateTimeProxy.now()),
    };
    return await this.rewardService.insert(dataInput);
  }

  async verificationGeneticAnalyst(
    accountId: string,
    verificationStatus: string,
  ) {
    const updateGeneticAnalystVerificationStatusPromise = new Promise(
      // eslint-disable-next-line
      (resolve, _reject) => {
        updateGeneticAnalystVerificationStatus(
          this.subtrateService.api as any,
          this.subtrateService.pair,
          accountId,
          <GeneticAnalystsVerificationStatus>verificationStatus,
          () => resolve('resolved'),
        );
      },
    );
    await updateGeneticAnalystVerificationStatusPromise;

    return { message: `${accountId} is ${verificationStatus}` };
  }
}
