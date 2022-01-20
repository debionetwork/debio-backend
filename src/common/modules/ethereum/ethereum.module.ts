import { Module } from '@nestjs/common';
import { EthersModule } from 'nestjs-ethers';
import { EthereumService } from './ethereum.service';
import { CachesModule } from '../caches';
import { ProcessEnvModule } from '../proxies';

@Module({
  imports: [
    EthersModule.forRoot({
      network: process.env.WEB3_RPC,
      useDefaultProvider: true,
    }),
    CachesModule,
    ProcessEnvModule,
  ],
  providers: [EthereumService],
  exports: [CachesModule, EthersModule, EthereumService],
})
export class EthereumModule {}
