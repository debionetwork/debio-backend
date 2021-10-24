import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
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
    private readonly rewardRepository: Repository<Reward>
  ) {}

  create(data : DataInput) {
    try {
      return this.rewardRepository.save(data)
    } catch (error) {
      return { error }
    }
  }
}