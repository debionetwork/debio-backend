import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowAccounts } from './models/deposit.entity';
import { EscrowService } from './escrow.service';
import { EthereumModule, SubstrateModule } from '../..';
import { GCloudSecretManagerModule } from '@debionetwork/nestjs-gcloud-secret-manager';

require('dotenv').config(); // eslint-disable-line
@Module({
  imports: [
    GCloudSecretManagerModule,
    TypeOrmModule.forFeature([EscrowAccounts]),
    SubstrateModule,
    forwardRef(() => EthereumModule),
  ],
  providers: [EscrowService],
  exports: [TypeOrmModule, EscrowService],
})
export class EscrowModule {}
