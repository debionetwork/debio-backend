import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TransactionLoggingModule } from '../../common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    TransactionLoggingModule,
    GCloudSecretManagerModule,
    ElasticsearchModule.registerAsync({
      imports: [GCloudSecretManagerModule],
      inject: [GCloudSecretManagerService],
      useFactory: async (
        gCloudSecretManagerService: GCloudSecretManagerService,
      ) => {
        await gCloudSecretManagerService.loadSecrets();
        return {
          node: process.env.ELASTICSEARCH_NODE,
          auth: {
            username: gCloudSecretManagerService
              .getSecret('ELASTICSEARCH_USERNAME')
              .toString(),
            password: gCloudSecretManagerService
              .getSecret('ELASTICSEARCH_PASSWORD')
              .toString(),
          },
        };
      },
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
