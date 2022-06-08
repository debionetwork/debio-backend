import { Module } from '@nestjs/common';
import { DateTimeModule } from '../../common';
import { RewardModule } from '../../common/modules/reward/reward.module';
import { ProcessEnvModule, SubstrateModule } from '../../common';
import { NotificationModule } from '../notification/notification.module';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [SubstrateModule, RewardModule, DateTimeModule, ProcessEnvModule, NotificationModule],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
