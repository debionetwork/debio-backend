import { Module } from '@nestjs/common';
import { DateTimeModule, GoogleSecretManagerModule } from '../../common';
import { TransactionLoggingModule } from '../../common/modules/transaction-logging/transaction-logging.module';
import { SubstrateModule } from '../../common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [
    SubstrateModule,
    TransactionLoggingModule,
    DateTimeModule,
    GoogleSecretManagerModule,
  ],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
