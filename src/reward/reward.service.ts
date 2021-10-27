import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SubstrateService } from "src/substrate/substrate.service";
import { Repository } from "typeorm";
import { Reward } from "./models/reward.entity";

interface DataInput {
  address: string;
  ref_number: string;
  reward_amount: number;
  reward_type: string;
  currency: string;
  create_at: Date;
}

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    private substrateService: SubstrateService,
  ) {}

  insert(data : DataInput) {
    try {
      return this.rewardRepository.save(data)
    } catch (error) {
      return { error }
    }
  }

  async sendReward(
    acountId: string,
    amount: number | string
    ) {
        await this.substrateService.sendReward(
          acountId,
          amount
        )
  }
}