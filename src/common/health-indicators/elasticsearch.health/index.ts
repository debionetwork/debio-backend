import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TerminusModule } from '@nestjs/terminus';
import { ElasticsearchHealthIndicator } from './elasticsearch.health.indicator';
 
@Module({
  imports: [
    TerminusModule,
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
  exports: [
    ElasticsearchModule,
    ElasticsearchHealthIndicator
  ],
  providers: [
    ElasticsearchHealthIndicator
  ],
})
export class ElasticsearchHealthModule {}

export * from './elasticsearch.health.indicator';