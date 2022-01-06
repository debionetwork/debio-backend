import { Module } from '@nestjs/common';
import { DateTimeModule } from '../../common/proxies/date-time/date-time.module';
import { ProcessEnvModule } from '../../common/proxies/process-env/process-env.module';
import { RewardModule } from '../../common/utilities/reward/reward.module';
import { SubstrateModule } from '../../substrate/substrate.module';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [SubstrateModule, RewardModule, DateTimeModule, ProcessEnvModule],
  controllers: [VerificationController],
  providers: [VerificationService],
})
export class VerificationModule {}
