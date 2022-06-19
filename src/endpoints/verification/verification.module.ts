import { Module } from '@nestjs/common';
import { DateTimeModule, NotificationModule } from '../../common';
import { TransactionLoggingModule } from '../../common/modules/transaction-logging/transaction-logging.module';
import { ProcessEnvModule, SubstrateModule } from '../../common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [
    SubstrateModule,
    TransactionLoggingModule,
    DateTimeModule,
    ProcessEnvModule,
    NotificationModule,
  ],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
