import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TransactionLoggingModule } from 'src/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    TransactionLoggingModule,
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        node: process.env.ELASTICSEARCH_NODE,
        auth: {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD,
        },
      }),
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
