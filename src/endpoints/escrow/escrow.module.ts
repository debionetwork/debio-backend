import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowAccounts } from './models/deposit.entity';
import { EscrowService } from './escrow.service';
import { SubstrateModule } from '../../common';
import { EthereumModule } from '../ethereum/ethereum.module';

require('dotenv').config(); // eslint-disable-line
@Module({
  imports: [
    TypeOrmModule.forFeature([EscrowAccounts]),
    SubstrateModule,
    forwardRef(() => EthereumModule),
  ],
  providers: [EscrowService],
  exports: [TypeOrmModule, EscrowService],
})
export class EscrowModule {}
