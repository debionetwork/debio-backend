import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SubstrateService } from "src/substrate/substrate.service";
import { Repository } from "typeorm";
import { RewardDto } from "./dto/reward.dto";
import { Reward } from "./models/reward.entity";


@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    private substrateService: SubstrateService,
  ) {}

  insert(data : RewardDto) {
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