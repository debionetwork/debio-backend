import { forwardRef, Module } from '@nestjs/common';
import { SubstrateService } from '../endpoints/substrate/substrate.service';
import { SubstrateController } from '../endpoints/substrate/substrate.controller';
import { EscrowModule } from '../endpoints/escrow/escrow.module';
import { TransactionLoggingModule } from '../common/utilities/transaction-logging/transaction-logging.module';
import { RewardModule } from '../common/utilities/reward/reward.module';
import { MailModule } from '../common/utilities/mailer/mailer.module';
import { LocationModule } from '../endpoints/location/location.module';
import { DebioConversionModule } from '../common/utilities/debio-conversion/debio-conversion.module';

@Module({
  imports: [
    forwardRef(() => EscrowModule),
    forwardRef(() => RewardModule),
    LocationModule,
    DebioConversionModule,
    TransactionLoggingModule,
    MailModule,
  ],
  controllers: [SubstrateController],
  providers: [SubstrateService],
  exports: [SubstrateService],
})
export class SubstrateModule {}
