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
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';

@Module({
  imports: [
    LocationModule,
    DebioConversionModule,
    GCloudSecretManagerModule,
    ElasticsearchModule.registerAsync({
      imports: [GCloudSecretManagerModule.withConfig(process.env.PARENT)],
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
