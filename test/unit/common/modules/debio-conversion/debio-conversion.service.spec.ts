import { Test, TestingModule } from '@nestjs/testing';
import {
  DebioConversionService,
  ProcessEnvProxy,
} from '../../../../../src/common';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('Debio Conversion Service Unit Tests', () => {
  let debioConversionService: DebioConversionService;
  const axiosMock = new MockAdapter(axios);

  const REDIS_STORE_URL = 'URL';
  const REDIS_STORE_USERNAME = 'REDIS_STORE_USERNAME';
  const REDIS_STORE_PASSWORD = 'REDIS_STORE_PASSWORD';
  class ProcessEnvProxyMock {
    env = { REDIS_STORE_URL, REDIS_STORE_USERNAME, REDIS_STORE_PASSWORD };
  }

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DebioConversionService,
        ProcessEnvProxy,
        { provide: ProcessEnvProxy, useClass: ProcessEnvProxyMock },
      ],
    }).compile();

    debioConversionService = module.get(DebioConversionService);
    axiosMock.reset();
  });

  it('should be defined', () => {
    // Assert
    expect(debioConversionService).toBeDefined();
  });

  it('should get exchange', () => {
    // Arrange
    const EXPECTED_URL_PARAM = `${REDIS_STORE_URL}/cache`;
    const RESULT = 0;
    axiosMock.onGet(EXPECTED_URL_PARAM).reply(200, RESULT);

    // Assert
    expect(debioConversionService.getExchange()).resolves.toEqual(RESULT);
  });
});
