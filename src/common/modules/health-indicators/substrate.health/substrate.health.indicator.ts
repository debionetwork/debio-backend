import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { SubstrateService } from '../../substrate';

@Injectable()
export class SubstrateHealthIndicator extends HealthIndicator {
  constructor(private readonly substrate: SubstrateService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      const conn = await this.substrate.api.isConnected;
      if (!conn) {
        throw Error('Substrate Node Disconnected');
      }
      return this.getStatus('substrate-node', true);
    } catch (error) {
      throw new HealthCheckError(
        'SubstrateHealthIndicator failed',
        error,
      );
    }
  }
}
