import { Module } from '@nestjs/common';
import { DateTimeModule } from '../../common/proxies/date-time/date-time.module';
import { ProcessEnvModule } from '../../common/proxies/process-env/process-env.module';
import { RewardModule } from '../../common/modules/reward/reward.module';
import { SubstrateModule } from '../../common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [SubstrateModule, RewardModule, DateTimeModule, ProcessEnvModule],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
