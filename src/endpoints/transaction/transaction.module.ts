import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TransactionLoggingModule } from 'src/common/modules/transaction-logging/transaction-logging.module';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [TransactionLoggingModule, ElasticsearchModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
