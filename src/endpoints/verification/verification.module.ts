import { Module } from '@nestjs/common';
import { DateTimeModule } from '../../common/date-time/date-time.module';
import { ProcessEnvModule } from '../../common/process-env/process-env.module';
import { RewardModule } from '../../reward/reward.module';
import { SubstrateModule } from '../../substrate/substrate.module';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [SubstrateModule, RewardModule, DateTimeModule, ProcessEnvModule],
  controllers: [VerificationController],
  providers: [VerificationService],
})
export class VerificationModule {}
