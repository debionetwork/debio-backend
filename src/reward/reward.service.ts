import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DbioBalanceService } from "src/dbio-balance/dbio_balance.service";
import { SubstrateService } from "src/substrate/substrate.service";
import { Repository } from "typeorm";
import { Reward } from "./models/reward.entity";

interface DataInput {
  address: string;
  ref_number: string;
  reward_amount: bigint;
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
    private dbioBalanceService: DbioBalanceService
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
        return await this.substrateService.sendReward(
          acountId,
          amount
        )
  }
}