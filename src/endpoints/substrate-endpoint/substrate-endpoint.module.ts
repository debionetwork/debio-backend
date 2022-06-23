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
  GoogleSecretManagerModule,
  GoogleSecretManagerService,
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
  ],
})
export class SubstrateEndpointModule {}
