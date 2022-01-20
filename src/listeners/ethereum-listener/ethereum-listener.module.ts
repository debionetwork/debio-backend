import { Module } from '@nestjs/common';
import { EthereumModule } from '../../../src/common';
import { EscrowModule } from '../../../src/endpoints/escrow/escrow.module';
import { SubstrateListenerHandler } from '../substrate-listener/substrate-listener.handler';

@Module({
  imports: [
      EthereumModule,
      EscrowModule,
  ],
  providers: [
    SubstrateListenerHandler
  ]
})
export class EthereumListenerModule {}
