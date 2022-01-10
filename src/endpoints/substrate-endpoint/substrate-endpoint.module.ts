import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ServiceController } from './services/service.controller';
import { ServiceService } from './services/service.service';
import { LabController } from './labs/lab.controller';
import { LabService } from './services/lab.service';
import { OrderController } from './orders/order.controller';
import { OrderService } from './services/order.service';
import { RewardModule, SubstrateModule } from '../../common';
import { SubstrateController } from './substrate-endpoint.controller';

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
    SubstrateModule,
    RewardModule,
  ],
  exports: [ElasticsearchModule],
  controllers: [SubstrateController, ServiceController, LabController, OrderController],
  providers: [ServiceService, LabService, OrderService],
})
export class SubstrateEndpointModule {}
