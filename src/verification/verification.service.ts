import { Injectable } from "@nestjs/common";
import { RewardDto } from "src/reward/dto/reward.dto";
import { RewardService } from "src/reward/reward.service";
import { SubstrateService } from "src/substrate/substrate.service";

@Injectable()
export class VerificationService {
  constructor(
    private subtrateService: SubstrateService,
    private rewardService: RewardService
  ) {}
  
  async vericationLab(
    acountId: string,
    verification_status: string
  ) {

    // Update Status Lab to Verified
    await this.subtrateService.verificationLabWithSubstrate(
      acountId,
      verification_status
    )

    //Send Reward 2 DBIO
    if(verification_status === 'Verified'){
      await this.subtrateService.sendReward(acountId, 2)
    }
    
    //Write to Reward Logging
    const dataInput: RewardDto = {
      address: acountId,
      ref_number: '-',
      reward_amount: 2,
      reward_type: 'Lab Verified',
      currency: 'DBIO',
      created_at: new Date()
    }
    await this.rewardService.insert(dataInput)
  }
}