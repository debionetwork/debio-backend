import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ServiceService } from './services/service.service';
import { LabService } from './services/lab.service';
import { OrderService } from './services/order.service';
import {
  DebioConversionModule,
  DateTimeModule,
  RewardModule,
  SubstrateModule,
  DebioNotificationModule,
} from '../../common';
import { SubstrateController } from './substrate-endpoint.controller';
import { ServiceRequestService } from './services/service-request.service';
import { LocationModule } from '../location/location.module';
import { GeneticAnalysisService } from './services/genetic-analysis.service';
import { GeneticAnalysisOrderService } from './services/genetic-analysis-order.service';

@Module({
  imports: [
    LocationModule,
    DebioConversionModule,
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
    DebioNotificationModule,
  ],
  exports: [ElasticsearchModule],
  controllers: [SubstrateController],
  providers: [
    ServiceService,
    LabService,
    OrderService,
    ServiceRequestService,
    GeneticAnalysisService,
    GeneticAnalysisOrderService,
  ],
})
export class SubstrateEndpointModule {}
