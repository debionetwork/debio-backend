import { ElasticsearchService } from '@nestjs/elasticsearch';
import { HealthCheckError } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchHealthIndicator } from '../../../../../src/common';
import { elasticsearchServiceMockFactory, MockType } from '../../../mock';

describe('Substrate Health Indicator Unit Tests', () => {
  let healthIndicator: ElasticsearchHealthIndicator;
  let elasticsearchServiceMock: MockType<ElasticsearchService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElasticsearchHealthIndicator,
        {
          provide: ElasticsearchService,
          useFactory: elasticsearchServiceMockFactory,
        },
      ],
    }).compile();

    healthIndicator = module.get(ElasticsearchHealthIndicator);
    elasticsearchServiceMock = module.get(ElasticsearchService);
  });

  it('should be defined', () => {
    expect(healthIndicator).toBeDefined();
  });

  it('should return healthcheck', async () => {
    // Arrange
    const EXPECTED_RESULT = { elasticsearch: { status: 'up' } };

    // Assert
    expect(await healthIndicator.isHealthy()).toEqual(EXPECTED_RESULT);
  });

  it('should throw error', () => {
    // Arrange
    elasticsearchServiceMock.ping.mockImplementationOnce(() =>
      Promise.reject('ERROR_RESULT'),
    );

    // Assert
    expect(healthIndicator.isHealthy).rejects.toThrow(HealthCheckError);
    expect(healthIndicator.isHealthy).rejects.toThrow(
      'ElasticsearchHealthIndicator failed',
    );
  });
});
