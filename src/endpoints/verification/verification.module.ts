import { Module } from '@nestjs/common';
import { DateTimeModule } from '../../common';
import { TransactionLoggingModule } from '../../common/modules/transaction-logging/transaction-logging.module';
import { SubstrateModule } from '../../common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyriadAccount } from '@endpoints/myriad/models/myriad-account.entity';

@Module({
  imports: [
    SubstrateModule,
    TransactionLoggingModule,
    DateTimeModule,
    TypeOrmModule.forFeature([MyriadAccount]),
  ],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
