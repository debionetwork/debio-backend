import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TerminusModule } from '@nestjs/terminus';
import { ElasticsearchHealthIndicator } from './elasticsearch.health.indicator';
import { keyList } from '../../../secrets';

@Module({
  imports: [
    TerminusModule,
    ElasticsearchModule.registerAsync({
      inject: [GCloudSecretManagerService],
      useFactory: async (
        gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
      ) => {
        return {
          node: gCloudSecretManagerService
            .getSecret('ELASTICSEARCH_NODE')
            .toString(),
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
  ],
  exports: [ElasticsearchModule, ElasticsearchHealthIndicator],
  providers: [ElasticsearchHealthIndicator],
})
export class ElasticsearchHealthModule {}

export * from './elasticsearch.health.indicator';
