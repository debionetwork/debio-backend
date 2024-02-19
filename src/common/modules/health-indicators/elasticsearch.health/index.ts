import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TerminusModule } from '@nestjs/terminus';
import { ElasticsearchHealthIndicator } from './elasticsearch.health.indicator';
import { config } from 'src/config';

@Module({
  imports: [
    TerminusModule,
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
  ],
  exports: [ElasticsearchModule, ElasticsearchHealthIndicator],
  providers: [ElasticsearchHealthIndicator],
})
export class ElasticsearchHealthModule {}

export * from './elasticsearch.health.indicator';
