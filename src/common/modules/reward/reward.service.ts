import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RewardDto } from './dto/reward.dto';
import { Reward } from './models/reward.entity';

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
  ) {}

  insert(data: RewardDto) {
    try {
      return this.rewardRepository.save(data);
    } catch (error) {
      return { error };
    }
  }

  async getLastRewardByAccountId(accountId){
    try {
      const res = await this.rewardRepository.find({
        where: {
          address: accountId
        },
        order: {
          created_at: 'DESC',
        }
      });

      return res[0];
    } catch (error) {
      return error;
    }
  }

  getRewardBindingByAccountId(accountId) {
    try {
      return this.rewardRepository.findOne({
        where: {
          reward_type: 'Registered User',
          address: accountId,
        },
      });
    } catch (error) {
      return error;
    }
  }
}
