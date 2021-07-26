import { Module } from '@nestjs/common';
import { EthereumModule } from './escrow/ethereum.model';
import { DBModule } from './database/db.module';

require('dotenv').config(); // eslint-disable-line
@Module({
  imports: [DBModule, EthereumModule],
})
export class AppModule {}
