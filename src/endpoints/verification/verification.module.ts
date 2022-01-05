import { Module } from '@nestjs/common';
import { DateTimeModule } from 'src/common/date-time/date-time.module';
import { ProcessEnvModule } from 'src/common/process-env/process-env.module';
import { RewardModule } from 'src/reward/reward.module';
import { SubstrateModule } from 'src/substrate/substrate.module';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [SubstrateModule, RewardModule, DateTimeModule, ProcessEnvModule],
  controllers: [VerificationController],
  providers: [VerificationService],
})
export class VerificationModule {}
