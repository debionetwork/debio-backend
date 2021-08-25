import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ServiceController } from './services/service.controller';
import { ServiceService } from './services/service.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        node: process.env.ELASTICSEARCH_NODE,
      }),
    }),
  ],
  exports: [ElasticsearchModule],
  controllers: [ServiceController],
  providers: [ServiceService],
})
export class SubstrateIndexedDataModule {}
