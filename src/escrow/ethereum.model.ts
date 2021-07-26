import { Module } from '@nestjs/common';
import { EthersModule } from 'nestjs-ethers';
import { DBModule } from '../database/db.module';
import { EthereumServer } from './ethereum.service';
import { TickerController } from './event.controller';
import { TestService } from './ethereum_temp.sevices';

@Module({
  imports: [
    DBModule,
    EthersModule.forRoot({
      network: 'wss://testnet.theapps.dev/node',
      useDefaultProvider: true,
    }),
  ],
  controllers: [TickerController],
  providers: [EthereumServer, TestService],
})
export class EthereumModule {}
