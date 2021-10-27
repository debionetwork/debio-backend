import { forwardRef, Module } from '@nestjs/common';
import { SubstrateService } from './substrate.service';
import { SubstrateController } from './substrate.controller';
import { EscrowModule } from '../escrow/escrow.module';
import { TransactionLoggingModule } from '../transaction-logging/transaction-logging.module';
import { RewardModule } from 'src/reward/reward.module';

@Module({
  imports: [forwardRef(() => EscrowModule),forwardRef(() => RewardModule), TransactionLoggingModule],
  controllers: [SubstrateController],
  providers: [SubstrateService],
  exports: [SubstrateService],
})
export class SubstrateModule {}
