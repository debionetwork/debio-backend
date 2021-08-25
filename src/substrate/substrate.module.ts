import { forwardRef, Module } from '@nestjs/common';
import { SubstrateService } from './substrate.service';
import { SubstrateController } from './substrate.controller';
import { EscrowModule } from 'src/escrow/escrow.module';
import { TransactionLoggingModule } from 'src/transaction-logging/transaction-logging.module';

@Module({
  imports: [forwardRef(() => EscrowModule), TransactionLoggingModule],
  controllers: [SubstrateController],
  providers: [SubstrateService],
  exports: [SubstrateService],
})
export class SubstrateModule {}
