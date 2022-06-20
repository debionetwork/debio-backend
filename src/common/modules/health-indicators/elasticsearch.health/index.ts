import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TerminusModule } from '@nestjs/terminus';
import {
  GoogleSecretManagerModule,
  GoogleSecretManagerService,
} from '../../google-secret-manager';
import { ElasticsearchHealthIndicator } from './elasticsearch.health.indicator';

@Module({
  imports: [
    TerminusModule,
    GoogleSecretManagerModule,
    ElasticsearchModule.registerAsync({
      imports: [GoogleSecretManagerModule],
      inject: [GoogleSecretManagerService],
      useFactory: async (
        googleSecretManagerService: GoogleSecretManagerService,
      ) => {
        await googleSecretManagerService.accessAndAccessSecret();
        return {
          node: googleSecretManagerService.elasticsearchNode,
          auth: {
            username: googleSecretManagerService.elasticsearchUsername,
            password: googleSecretManagerService.elasticsearchPassword,
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
