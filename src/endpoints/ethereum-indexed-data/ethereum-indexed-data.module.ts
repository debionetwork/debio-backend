import { forwardRef, Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ServiceRequestController } from './service-request/service-request.controller';
import { ServiceRequestService } from './service-request/service-request.service';
import { LocationModule } from '../../endpoints/location/location.module';
import { EthereumModule } from '../../endpoints/ethereum/ethereum.module';
import { DebioConversionModule } from '../../common/modules/debio-conversion/debio-conversion.module';

@Module({
  imports: [
    LocationModule,
    EthereumModule,
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
  ],
  exports: [ElasticsearchModule],
  controllers: [ServiceRequestController],
  providers: [ServiceRequestService],
})
export class EthereumIndexedDataModule {}
