import { Module } from '@nestjs/common';
import { DateTimeModule, DebioNotificationModule } from '../../common';
import { RewardModule } from '../../common/modules/reward/reward.module';
import { ProcessEnvModule, SubstrateModule } from '../../common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [
    SubstrateModule,
    RewardModule,
    DateTimeModule,
    ProcessEnvModule,
    DebioNotificationModule,
  ],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
