import { Injectable } from '@nestjs/common';
import { RewardDto } from '../../common/modules/reward/dto/reward.dto';
import { RewardService } from '../../common/modules/reward/reward.service';
import {
  DateTimeProxy,
  updateGeneticAnalystVerificationStatus,
  convertToDbioUnitString,
  LabVerificationStatus,
  sendRewards,
  SubstrateService,
  updateLabVerificationStatus,
} from '../../common';
import { GeneticAnalystsVerificationStatus } from '../../common/polkadot-provider/models/genetic-analysts';

@Injectable()
export class VerificationService {
  constructor(
    private readonly dateTimeProxy: DateTimeProxy,
    private readonly subtrateService: SubstrateService,
    private readonly rewardService: RewardService,
  ) {}

  async vericationLab(substrateAddress: string, verificationStatus: string) {
    // Update Status Lab to Verified
    await updateLabVerificationStatus(
      this.subtrateService.api,
      this.subtrateService.pair,
      substrateAddress,
      <LabVerificationStatus>verificationStatus,
    );

    //Send Reward 2 DBIO
    if (verificationStatus === 'Verified') {
      const reward = 2;
      await sendRewards(
        this.subtrateService.api,
        this.subtrateService.pair,
        substrateAddress,
        convertToDbioUnitString(reward),
      );
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
    await updateGeneticAnalystVerificationStatus(
      this.subtrateService.api,
      this.subtrateService.pair,
      accountId,
      <GeneticAnalystsVerificationStatus>verificationStatus,
    );

    return { message: `${accountId} is ${verificationStatus}` };
  }
}
