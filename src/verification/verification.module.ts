import { Module } from '@nestjs/common';
import { DateTimeModule } from 'src/common/date-time/date-time.module';
import { RewardModule } from 'src/reward/reward.module';
import { SubstrateModule } from 'src/substrate/substrate.module';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [SubstrateModule, RewardModule, DateTimeModule],
  controllers: [VerificationController],
  providers: [VerificationService],
})
export class VerificationModule {}
