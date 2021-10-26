import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DbioBalanceModule } from "src/dbio-balance/dbio_balance.module";
import { SubstrateModule } from "src/substrate/substrate.module";
import { Reward } from "./models/reward.entity";
import { RewardController } from "./reward.controller";
import { RewardService } from "./reward.service";

@Module({
  imports: [TypeOrmModule.forFeature([Reward]), DbioBalanceModule, SubstrateModule],
  controllers: [RewardController],
  providers: [RewardService],
  exports: [TypeOrmModule, RewardService]
})
export class RewardModule {}