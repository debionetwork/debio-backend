import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowAccounts } from './models/deposit.entity';
import { EscrowService } from './escrow.service';
import { ProcessEnvModule, SubstrateModule } from '../../common';
import { EthereumModule } from '../ethereum/ethereum.module';

require('dotenv').config(); // eslint-disable-line
@Module({
  imports: [
    TypeOrmModule.forFeature([EscrowAccounts]),
    forwardRef(() => SubstrateModule),
    forwardRef(() => EthereumModule),
    ProcessEnvModule,
  ],
  providers: [EscrowService],
  exports: [TypeOrmModule, EscrowService],
})
export class EscrowModule {}
