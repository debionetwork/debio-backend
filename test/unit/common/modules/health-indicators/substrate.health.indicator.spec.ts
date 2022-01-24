import { HealthCheckError } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import {
  SubstrateHealthIndicator,
  SubstrateService,
} from '../../../../../src/common';
import { MockType, substrateServiceMockFactory } from '../../../mock';

describe('Substrate Health Indicator Unit Tests', () => {
  let healthIndicator: SubstrateHealthIndicator;
  let substrateServiceMock: MockType<SubstrateService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubstrateHealthIndicator,
        { provide: SubstrateService, useFactory: substrateServiceMockFactory },
      ],
    }).compile();

    healthIndicator = module.get(SubstrateHealthIndicator);
    substrateServiceMock = module.get(SubstrateService);
  });

  it('should be defined', () => {
    expect(healthIndicator).toBeDefined();
  });

  it('should return healthcheck', async () => {
    // Arrange
    Reflect.set(substrateServiceMock, 'api', {
      isConnected: true,
    });
    const EXPECTED_RESULT = { 'substrate-node': { status: 'up' } };

    // Assert
    expect(await healthIndicator.isHealthy()).toEqual(EXPECTED_RESULT);
  });

  it('should throw error', () => {
    // Arrange
    Reflect.set(substrateServiceMock, 'api', {
      isConnected: false,
    });

    // Assert
    expect(healthIndicator.isHealthy).rejects.toThrow(HealthCheckError);
    expect(healthIndicator.isHealthy).rejects.toThrow(
      'SubstrateHealthIndicator failed',
    );
  });
});
