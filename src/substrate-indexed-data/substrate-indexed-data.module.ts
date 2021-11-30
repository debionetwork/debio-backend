import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ServiceController } from './services/service.controller';
import { ServiceService } from './services/service.service';
import { LabController } from './labs/lab.controller';
import { LabService } from './labs/lab.service';
import { OrderController } from './orders/order.controller';
import { OrderService } from './orders/order.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        node: process.env.ELASTICSEARCH_NODE,
        auth: {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD
        }
      }),
    }),
  ],
  exports: [ElasticsearchModule],
  controllers: [ServiceController, LabController, OrderController],
  providers: [ServiceService, LabService, OrderService],
})
export class SubstrateIndexedDataModule {}
