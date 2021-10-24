import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reward } from "./models/reward.entity";
import { RewardService } from "./reward.service";

@Module({
  imports: [TypeOrmModule.forFeature([Reward])],
  controllers: [],
  providers: [RewardService],
  exports: [TypeOrmModule, RewardService]
})
export class RewardModule {}