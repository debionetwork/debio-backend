import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ServiceRequestController } from './service-request/service-request.controller';
import { ServiceRequestService } from './service-request/service-request.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        node: process.env.ELASTICSEARCH_NODE,
      }),
    }),
  ],
  exports: [ElasticsearchModule],
  controllers: [ServiceRequestController],
  providers: [ServiceRequestService],
})
export class EthereumIndexedDataModule {}
