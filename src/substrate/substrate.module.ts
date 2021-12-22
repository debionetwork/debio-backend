import { forwardRef, Module } from '@nestjs/common';
import { SubstrateService } from './substrate.service';
import { SubstrateController } from './substrate.controller';
import { EscrowModule } from '../escrow/escrow.module';
import { TransactionLoggingModule } from '../transaction-logging/transaction-logging.module';
import { RewardModule } from 'src/reward/reward.module';
import { DbioBalanceModule } from 'src/dbio-balance/dbio_balance.module';
import { MailModule } from 'src/common/mailer/mailer.module';
import { LocationModule } from 'src/location/location.module';

@Module({
  imports: [
    forwardRef(() => EscrowModule),
    forwardRef(() => RewardModule),
    LocationModule,
    DbioBalanceModule,
    TransactionLoggingModule,
    MailModule,
  ],
  controllers: [SubstrateController],
  providers: [SubstrateService],
  exports: [SubstrateService],
})
export class SubstrateModule {}
