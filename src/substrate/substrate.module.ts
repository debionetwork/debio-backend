import { forwardRef, Module } from '@nestjs/common';
import { SubstrateService } from './substrate.service';
import { SubstrateController } from './substrate.controller';
import { EscrowModule } from '../endpoints/escrow/escrow.module';
import { TransactionLoggingModule } from '../transaction-logging/transaction-logging.module';
import { RewardModule } from '../common/reward/reward.module';
import { MailModule } from '../common/mailer/mailer.module';
import { LocationModule } from '../endpoints/location/location.module';
import { DebioConversionModule } from '../common/debio-conversion/debio-conversion.module';

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
