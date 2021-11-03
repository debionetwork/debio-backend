import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RewardDto } from "./dto/reward.dto";
import { Reward } from "./models/reward.entity";


@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
  ) {}

  insert(data : RewardDto) {
    try {
      return this.rewardRepository.save(data)
    } catch (error) {
      return { error }
    }
  }
}