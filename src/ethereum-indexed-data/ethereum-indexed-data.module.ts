import { forwardRef, Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ServiceRequestController } from './service-request/service-request.controller';
import { ServiceRequestService } from './service-request/service-request.service';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [
    forwardRef(() => LocationModule),
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
