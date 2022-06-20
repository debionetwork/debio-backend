import { Injectable } from '@nestjs/common';
import { RewardDto } from '../../common/modules/reward/dto/reward.dto';
import { RewardService } from '../../common/modules/reward/reward.service';
import { DateTimeProxy, SubstrateService } from '../../common';
import {
  updateGeneticAnalystVerificationStatus,
  convertToDbioUnitString,
  sendRewards,
  updateLabVerificationStatus,
} from '@debionetwork/polkadot-provider';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';

@Injectable()
export class VerificationService {
  constructor(
    private readonly dateTimeProxy: DateTimeProxy,
    private readonly subtrateService: SubstrateService,
    private readonly rewardService: RewardService,
  ) {}

  async verificationLab(substrateAddress: string, verificationStatus: string) {
    const currentTime = this.dateTimeProxy.new(); // eslint-disable-line
    // Update Status Lab to Verified
    await updateLabVerificationStatus(
      this.subtrateService.api as any,
      this.subtrateService.pair,
      substrateAddress,
      <VerificationStatus>verificationStatus,
    );

    //Send Reward 2 DBIO
    if (verificationStatus === 'Verified') {
      const reward = 2;
      // eslint-disable-next-line
      await sendRewards(
        this.subtrateService.api as any,
        this.subtrateService.pair,
        substrateAddress,
        convertToDbioUnitString(reward),
      );

      //Write to Reward Logging
      const dataInput: RewardDto = {
        address: substrateAddress,
        ref_number: '-',
        reward_amount: 2,
        reward_type: 'Lab Verified',
        currency: 'DBIO',
        created_at: new Date(this.dateTimeProxy.now()),
      };

      await this.rewardService.insert(dataInput);
    }
  }

  async verificationGeneticAnalyst(
    accountId: string,
    verificationStatus: string,
  ) {
    await updateGeneticAnalystVerificationStatus(
      this.subtrateService.api as any,
      this.subtrateService.pair,
      accountId,
      <VerificationStatus>verificationStatus,
    );

    return { message: `${accountId} is ${verificationStatus}` };
  }
}
