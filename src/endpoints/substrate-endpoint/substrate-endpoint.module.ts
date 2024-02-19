import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ServiceService } from './services/service.service';
import { LabService } from './services/lab.service';
import { OrderService } from './services/order.service';
import {
  DebioConversionModule,
  DateTimeModule,
  TransactionLoggingModule,
  SubstrateModule,
} from '../../common';
import { SubstrateController } from './substrate-endpoint.controller';
import { ServiceRequestService } from './services/service-request.service';
import { LocationModule } from '../location/location.module';
import { GeneticAnalysisService } from './services/genetic-analysis.service';
import { GeneticAnalysisOrderService } from './services/genetic-analysis-order.service';
import { keyList } from '../../common/secrets';
import { MenstrualCalendarService } from './services/menstrual-calendar.service';
import { MenstrualSubscriptionService } from './services/menstrual-subscription.service';
import { config } from 'src/config';

@Module({
  imports: [
    LocationModule,
    DebioConversionModule,
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
    SubstrateModule,
    TransactionLoggingModule,
    DateTimeModule,
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
    MenstrualCalendarService,
    MenstrualSubscriptionService,
  ],
})
export class SubstrateEndpointModule {}
