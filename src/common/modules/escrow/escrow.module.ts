import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowAccounts } from './models/deposit.entity';
import { EscrowService } from './escrow.service';
import { EthereumModule, SubstrateModule } from '../..';
import { GoogleSecretManagerModule } from '../google-secret-manager';

require('dotenv').config(); // eslint-disable-line
@Module({
  imports: [
    GoogleSecretManagerModule,
    TypeOrmModule.forFeature([EscrowAccounts]),
    SubstrateModule,
    forwardRef(() => EthereumModule),
  ],
  providers: [EscrowService],
  exports: [TypeOrmModule, EscrowService],
})
export class EscrowModule {}
