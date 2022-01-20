import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class ElasticsearchHealthIndicator extends HealthIndicator {
  constructor(private readonly elasticsearchService: ElasticsearchService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await this.elasticsearchService.ping();
      return this.getStatus('elasticsearch', true);
    } catch (error) {
      throw new HealthCheckError(
        'ElasticsearchHealthIndicator failed',
        error,
      );
    }
  }
}
