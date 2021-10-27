import { Module } from "@nestjs/common";
import { RewardModule } from "src/reward/reward.module";
import { SubstrateModule } from "src/substrate/substrate.module";
import { VerificationController } from "./verification.controller";
import { VerificationService } from "./verifivcation.service";

@Module({
  imports: [
    SubstrateModule,
    RewardModule
  ],
  controllers: [VerificationController],
  providers: [VerificationService]
})
export class VerificationModule {}