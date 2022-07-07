import { Module } from '@nestjs/common';
import { DateTimeModule } from '../../common';
import { TransactionLoggingModule } from '../../common/modules/transaction-logging/transaction-logging.module';
import { SubstrateModule } from '../../common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { GCloudSecretManagerModule } from '@debionetwork/nestjs-gcloud-secret-manager';

@Module({
  imports: [
    SubstrateModule,
    TransactionLoggingModule,
    DateTimeModule,
    GCloudSecretManagerModule.withConfig(process.env.PARENT),
  ],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
