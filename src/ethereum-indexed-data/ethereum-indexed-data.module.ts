import { forwardRef, Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ServiceRequestController } from './service-request/service-request.controller';
import { ServiceRequestService } from './service-request/service-request.service';
import { LocationModule } from '../location/location.module';
import { EthereumModule } from '../ethereum/ethereum.module';
import { DbioBalanceModule } from '../dbio-balance/dbio_balance.module';

@Module({
  imports: [
    forwardRef(() => LocationModule),
    forwardRef(() => EthereumModule),
    DbioBalanceModule,
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
