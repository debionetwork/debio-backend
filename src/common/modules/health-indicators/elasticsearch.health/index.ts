import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TerminusModule } from '@nestjs/terminus';
import { ElasticsearchHealthIndicator } from './elasticsearch.health.indicator';

@Module({
  imports: [
    TerminusModule,
    GCloudSecretManagerModule,
    ElasticsearchModule.registerAsync({
      imports: [GCloudSecretManagerModule],
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
  ],
  exports: [ElasticsearchModule, ElasticsearchHealthIndicator],
  providers: [ElasticsearchHealthIndicator],
})
export class ElasticsearchHealthModule {}

export * from './elasticsearch.health.indicator';
