import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { keyList } from '../../common/secrets';
import { TransactionLoggingModule } from '../../common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { config } from 'src/config';

@Module({
  imports: [
    TransactionLoggingModule,
    ElasticsearchModule.registerAsync({
      inject: [],
      useFactory: async () => {
        return {
          node: config.ELASTICSEARCH_NODE.toString(),
          auth: {
            username: config.ELASTICSEARCH_USERNAME.toString(),
            password: config.ELASTICSEARCH_PASSWORD.toString(),
          },
        };
      },
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
