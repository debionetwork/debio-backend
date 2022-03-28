import {
  DiskHealthIndicator,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { MockType } from '../../mock';
import { Connection } from 'typeorm';
import {
  ElasticsearchHealthIndicator,
  SubstrateHealthIndicator,
} from '../../../../src/common';
import { HealthController } from '../../../../src/endpoints/health/health.controller';
import { getConnectionToken } from '@nestjs/typeorm';

describe('Health Controller Unit Tests', () => {
  let controller: HealthController;
  let healthCheckServiceMock: MockType<HealthCheckService>;
  let typeOrmHealthIndicatorMock: MockType<TypeOrmHealthIndicator>;
  let memoryHealthIndicatorMock: MockType<MemoryHealthIndicator>;
  let diskHealthIndicatorMock: MockType<DiskHealthIndicator>;
  let elasticsearchHealthIndicatorMock: MockType<ElasticsearchHealthIndicator>;
  let substrateHealthIndicatorMock: MockType<SubstrateHealthIndicator>;
  let dbLocationConnectionMock: Connection;
  let defaultConnectionMock: Connection;

  const healthCheckServiceMockFactory: () => MockType<HealthCheckService> =
    jest.fn(() => ({
      check: jest.fn(),
    }));

  const typeOrmHealthIndicatorMockFactory: () => MockType<TypeOrmHealthIndicator> =
    jest.fn(() => ({
      pingCheck: jest.fn(),
    }));

  const memoryHealthIndicatorMockFactory: () => MockType<MemoryHealthIndicator> =
    jest.fn(() => ({
      checkHeap: jest.fn(),
    }));

  const diskHealthIndicatorMockFactory: () => MockType<DiskHealthIndicator> =
    jest.fn(() => ({
      checkStorage: jest.fn(),
    }));

  const elasticsearchHealthIndicatorMockFactory: () => MockType<ElasticsearchHealthIndicator> =
    jest.fn(() => ({
      isHealthy: jest.fn(),
    }));

  const substrateHealthIndicatorMockFactory: () => MockType<SubstrateHealthIndicator> =
    jest.fn(() => ({
      isHealthy: jest.fn(),
    }));

  const CONN_MOCK = 'CONN';
  class ConnectionMock {
    dbLocationConnection = CONN_MOCK;
    defaultConnection = CONN_MOCK;
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useFactory: healthCheckServiceMockFactory,
        },
        {
          provide: TypeOrmHealthIndicator,
          useFactory: typeOrmHealthIndicatorMockFactory,
        },
        {
          provide: MemoryHealthIndicator,
          useFactory: memoryHealthIndicatorMockFactory,
        },
        {
          provide: DiskHealthIndicator,
          useFactory: diskHealthIndicatorMockFactory,
        },
        {
          provide: ElasticsearchHealthIndicator,
          useFactory: elasticsearchHealthIndicatorMockFactory,
        },
        {
          provide: SubstrateHealthIndicator,
          useFactory: substrateHealthIndicatorMockFactory,
        },
        { provide: getConnectionToken('dbLocation'), useClass: ConnectionMock },
        { provide: Connection, useClass: ConnectionMock },
      ],
    }).compile();

    controller = module.get(HealthController);
    healthCheckServiceMock = module.get(HealthCheckService);
    typeOrmHealthIndicatorMock = module.get(TypeOrmHealthIndicator);
    memoryHealthIndicatorMock = module.get(MemoryHealthIndicator);
    diskHealthIndicatorMock = module.get(DiskHealthIndicator);
    elasticsearchHealthIndicatorMock = module.get(ElasticsearchHealthIndicator);
    substrateHealthIndicatorMock = module.get(SubstrateHealthIndicator);
    defaultConnectionMock = module.get(Connection);
    dbLocationConnectionMock = module.get(getConnectionToken('dbLocation'));
  });

  it('should be defined', () => {
    // Assert
    expect(controller).toBeDefined();
  });

  it('should health check', () => {
    // Arrange
    healthCheckServiceMock.check.mockImplementation((args) => {
      const result = [];
      for (let i = 0; i < args.length; i++) {
        result.push(args[i]());
      }
      return result;
    });
    typeOrmHealthIndicatorMock.pingCheck.mockReturnValue(1);
    memoryHealthIndicatorMock.checkHeap.mockReturnValue(1);
    diskHealthIndicatorMock.checkStorage.mockReturnValue(1);
    elasticsearchHealthIndicatorMock.isHealthy.mockReturnValue(1);
    substrateHealthIndicatorMock.isHealthy.mockReturnValue(1);
    const EXPECTED_RESULTS = [1, 1, 1, 1, 1, 1];

    // Assert
    expect(controller.check()).toEqual(EXPECTED_RESULTS);
    expect(typeOrmHealthIndicatorMock.pingCheck).toHaveBeenCalledTimes(2);
    expect(typeOrmHealthIndicatorMock.pingCheck).toHaveBeenCalledWith(
      'database',
      { connection: defaultConnectionMock },
    );
    expect(typeOrmHealthIndicatorMock.pingCheck).toHaveBeenCalledWith(
      'location-database',
      { connection: dbLocationConnectionMock },
    );
    expect(memoryHealthIndicatorMock.checkHeap).toHaveBeenCalledTimes(1);
    expect(memoryHealthIndicatorMock.checkHeap).toHaveBeenCalledWith(
      'memory heap',
      1000 * 1024 * 1024,
    );
    expect(diskHealthIndicatorMock.checkStorage).toHaveBeenCalledTimes(1);
    expect(diskHealthIndicatorMock.checkStorage).toHaveBeenCalledWith(
      'disk health',
      {
        thresholdPercent: 0.5,
        path: '/',
      },
    );
    expect(elasticsearchHealthIndicatorMock.isHealthy).toHaveBeenCalledTimes(1);
    expect(substrateHealthIndicatorMock.isHealthy).toHaveBeenCalledTimes(1);
  });
});
