import { Injectable } from '@nestjs/common';
import { DateTimeProxy } from '../../common/proxies/date-time';
import { RewardDto } from '../../common/reward/dto/reward.dto';
import { RewardService } from '../../common/reward/reward.service';
import { SubstrateService } from '../../substrate/substrate.service';

@Injectable()
export class VerificationService {
  constructor(
    private readonly dateTimeProxy: DateTimeProxy,
    private readonly subtrateService: SubstrateService,
    private readonly rewardService: RewardService,
  ) {}

  async vericationLab(acountId: string, verificationStatus: string) {
    // Update Status Lab to Verified
    await this.subtrateService.verificationLabWithSubstrate(
      acountId,
      verificationStatus,
    );

    //Send Reward 2 DBIO
    if (verificationStatus === 'Verified') {
      await this.subtrateService.sendReward(acountId, 2);
    }

    //Write to Reward Logging
    const dataInput: RewardDto = {
      address: acountId,
      ref_number: '-',
      reward_amount: 2,
      reward_type: 'Lab Verified',
      currency: 'DBIO',
      created_at: new Date(this.dateTimeProxy.now()),
    };
    return await this.rewardService.insert(dataInput);
  }
}
