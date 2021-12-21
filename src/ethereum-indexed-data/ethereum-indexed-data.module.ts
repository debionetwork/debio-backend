import { forwardRef, Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ServiceRequestController } from './service-request/service-request.controller';
import { ServiceRequestService } from './service-request/service-request.service';
import { LocationModule } from '../location/location.module';
import { EthereumModule } from '../ethereum/ethereum.module';
import { CacheRedisModule } from '../cache-redis/cache-redis.module';

@Module({
  imports: [
    forwardRef(() => LocationModule),
    forwardRef(() => EthereumModule),
    CacheRedisModule,
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
  controllers: [ServiceRequestController],
  providers: [ServiceRequestService],
})
export class EthereumIndexedDataModule {}
