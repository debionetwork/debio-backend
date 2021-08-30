import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ServiceController } from './services/service.controller';
import { ServiceService } from './services/service.service';
import { LabController } from './labs/lab.controller';
import { LabService } from './labs/lab.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        node: process.env.ELASTICSEARCH_NODE,
      }),
    }),
  ],
  exports: [ElasticsearchModule],
  controllers: [ServiceController, LabController],
  providers: [ServiceService, LabService],
})
export class SubstrateIndexedDataModule {}
