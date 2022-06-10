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
      inject: [GoogleSecretManagerService],
      useFactory: async (
        googleSecretManagerService: GoogleSecretManagerService,
      ) => ({
        node: googleSecretManagerService.elasticsearchNode,
        auth: {
          username: googleSecretManagerService.elasticsearchUsername,
          password: googleSecretManagerService.elasticsearchPassword,
        },
      }),
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
