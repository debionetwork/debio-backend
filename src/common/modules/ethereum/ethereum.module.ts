import { Module } from '@nestjs/common';
import { EthersModule } from 'nestjs-ethers';
import { EthereumService } from './ethereum.service';
import { CachesModule } from '../caches';

@Module({
  imports: [
    EthersModule.forRoot({
      network: process.env.WEB3_RPC,
      useDefaultProvider: true,
    }),
    CachesModule,
  ],
  providers: [EthereumService],
  exports: [CachesModule, EthersModule, EthereumService],
})
export class EthereumModule {}
