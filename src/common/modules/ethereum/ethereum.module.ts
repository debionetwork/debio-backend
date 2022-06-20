import { Module } from '@nestjs/common';
import { EthersModule } from 'nestjs-ethers';
import { EthereumService } from './ethereum.service';
import { CachesModule } from '../caches';
import { ProcessEnvModule } from '../proxies';
import {
  GoogleSecretManagerModule,
  GoogleSecretManagerService,
} from '../google-secret-manager';

@Module({
  imports: [
    GoogleSecretManagerModule,
    EthersModule.forRootAsync({
      imports: [GoogleSecretManagerModule],
      inject: [GoogleSecretManagerService],
      useFactory: async (
        googleSecretManagerService: GoogleSecretManagerService,
      ) => {
        await googleSecretManagerService.accessAndAccessSecret();
        return {
          network: googleSecretManagerService.web3RPC,
          useDefaultProvider: true,
        };
      },
    }),
    CachesModule,
    ProcessEnvModule,
  ],
  providers: [EthereumService],
  exports: [CachesModule, EthersModule, EthereumService],
})
export class EthereumModule {}
