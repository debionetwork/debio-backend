import { forwardRef, Module } from '@nestjs/common';
import { EthersModule } from 'nestjs-ethers';
import { EthereumService } from './ethereum.service';
import { EthereumController } from './ethereum.controller';
import { EscrowModule } from '../escrow/escrow.module';
import { CachesModule } from '../../common/modules/caches';
import { ProcessEnvModule } from 'src/common';

@Module({
  imports: [
    EthersModule.forRoot({
      network: process.env.WEB3_RPC,
      useDefaultProvider: true,
    }),
    forwardRef(() => EscrowModule),
    CachesModule,
    ProcessEnvModule,
  ],
  controllers: [EthereumController],
  providers: [EthereumService],
  exports: [EthereumService],
})
export class EthereumModule {}
