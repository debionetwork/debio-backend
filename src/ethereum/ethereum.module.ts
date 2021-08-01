import { Module } from '@nestjs/common';
import { EthersModule } from 'nestjs-ethers';
import { EthereumBlockService } from './ethereum.service';
import { EthereumController } from './ethereum.controller';
import { EscrowModule } from '../escrow/escrow.module';

@Module({
  imports: [
    EthersModule.forRoot({
      network: 'wss://testnet.theapps.dev/node',
      useDefaultProvider: true,
    }),
    EscrowModule,
  ],
  controllers: [EthereumController],
  providers: [EthereumBlockService],
})
export class EthereumModul {}
