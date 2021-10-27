import { Controller, Get, Post, Query } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";
import { response } from "express";
import { DbioBalanceService } from "src/dbio-balance/dbio_balance.service";
import { RewardService } from "./reward.service";

@Controller('sendReward')
export class RewardController {
  constructor(
    private readonly rewardService : RewardService,
    private readonly dbioBalanceService : DbioBalanceService
  ) {}

  @Post()
  @ApiQuery({ name: 'reward_type', enum: [
    'Registered User',
    'Lab Verified',
    'Customer Staking Request Service',
    'Customer Data Bounty',
    'Lab Provide Request Service'
  ]})
  @ApiQuery({ name: 'acount_id'})
  async sendReward(
    @Query('acount_id') acount_id : string,
    @Query('reward_type') reward_type: string
  ) {
    const dbio = Number((await this.dbioBalanceService.getDebioBalance()).dai)
    let reward_amount = 0

    switch (reward_type) {
      case 'Registered User':
        console.log(reward_type, 'Todo!');
        reward_amount = 0.01 * dbio
        break;
      case 'Lab Verified':
        console.log(reward_type, 'Todo!');
        reward_amount = 2 * dbio
        break;
      case 'Customer Staking Request Service':
        console.log(reward_type, 'Todo!');
        break;
      case 'Customer Data Bounty':
        console.log(reward_type, 'Todo!');
        break;
      case 'Lab Provide Request Service':
        console.log(reward_type, 'Todo!');
        break;
    }

    try {
      console.log('masuk', reward_amount, acount_id);

      await this.rewardService.sendReward(acount_id, reward_amount)
      console.log('done');
      
      
      return {
        statusCode: 201,
        message : `send ${reward_amount} DBIO to ${acount_id}`
      }
    } catch (error) {
      return response.status(500).send(error)
    }

  }
}