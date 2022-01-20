import { Module } from '@nestjs/common';
import { EthereumModule } from '../../common/modules/ethereum';
import { EscrowModule } from '../../endpoints/escrow/escrow.module';
import { EthereumListenerHandler } from './ethereum-listener.handler';

@Module({
  imports: [
    EthereumModule,
    EscrowModule,
  ],
  providers: [
    EthereumListenerHandler
  ]
})
export class EthereumListenerModule {}
