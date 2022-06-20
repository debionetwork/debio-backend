import { Module } from '@nestjs/common';
import { EthereumModule } from '../../common/modules/ethereum';
import { EscrowModule } from '../../common/modules/escrow/escrow.module';
import { EthereumListenerHandler } from './ethereum-listener.handler';
import { TransactionLoggingModule } from '../../common';

@Module({
  imports: [EthereumModule, EscrowModule, TransactionLoggingModule],
  providers: [EthereumListenerHandler],
})
export class EthereumListenerModule {}
