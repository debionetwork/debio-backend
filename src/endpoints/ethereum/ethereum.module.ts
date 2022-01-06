import { forwardRef, Module } from '@nestjs/common';
import { EthersModule } from 'nestjs-ethers';
import { EthereumService } from './ethereum.service';
import { EthereumController } from './ethereum.controller';
import { EscrowModule } from '../escrow/escrow.module';

@Module({
  imports: [
    EthersModule.forRoot({
      network: process.env.WEB3_RPC,
      useDefaultProvider: true,
    }),
    forwardRef(() => EscrowModule),
  ],
  controllers: [EthereumController],
  providers: [EthereumService],
  exports: [EthereumService],
})
export class EthereumModule {}
