import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ServiceService } from './services/service.service';
import { LabService } from './services/lab.service';
import { OrderService } from './services/order.service';
import { DateTimeModule, RewardModule, SubstrateModule } from '../../common';
import { SubstrateController } from './substrate-endpoint.controller';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        node: process.env.ELASTICSEARCH_NODE,
        auth: {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD,
        },
      }),
    }),
    SubstrateModule,
    RewardModule,
    DateTimeModule,
  ],
  exports: [ElasticsearchModule],
  controllers: [
    SubstrateController,
  ],
  providers: [ServiceService, LabService, OrderService],
})
export class SubstrateEndpointModule {}
