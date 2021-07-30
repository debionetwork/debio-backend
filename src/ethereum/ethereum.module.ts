import { Module } from '@nestjs/common';
import { EthersModule } from 'nestjs-ethers';
import { EthereumBlockService } from './ethereum.service';
import { EthereumController } from './ethereum.controller';

@Module({
  imports: [
    EthersModule.forRoot({
      network: 'wss://testnet.theapps.dev/node',
      useDefaultProvider: true,
    }),
  ],
  controllers: [EthereumController],
  providers: [EthereumBlockService],
})
export class EthereumModul {}
