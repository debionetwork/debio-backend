import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import {
  GoogleSecretManagerModule,
  GoogleSecretManagerService,
  TransactionLoggingModule,
} from '../../common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    TransactionLoggingModule,
    GoogleSecretManagerModule,
    ElasticsearchModule.registerAsync({
      imports: [GoogleSecretManagerModule],
      inject: [GoogleSecretManagerService],
      useFactory: async (
        googleSecretManagerService: GoogleSecretManagerService,
      ) => {
        return await googleSecretManagerService.elasticsSearchConfig();
      },
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
