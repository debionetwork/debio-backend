import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowAccounts } from './models/deposit.entity';
import { EscrowController } from './escrow.controller';
import { EscrowService } from './escrow.service';
import { SubstrateModule } from '../../substrate/substrate.module';
import { EthereumModule } from '../ethereum/ethereum.module';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

require('dotenv').config(); // eslint-disable-line
@Module({
  imports: [
    TypeOrmModule.forFeature([EscrowAccounts]),
    forwardRef(() => SubstrateModule),
    forwardRef(() => EthereumModule),
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        node: process.env.ELASTICSEARCH_NODE,
      }),
    }),
  ],
  controllers: [EscrowController],
  providers: [EscrowService],
  exports: [TypeOrmModule, EscrowService],
})
export class EscrowModule {}
