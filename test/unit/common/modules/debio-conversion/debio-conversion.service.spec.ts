import { Test, TestingModule } from '@nestjs/testing';
import { DebioConversionService, ProcessEnvProxy } from '../../../../../src/common';
import { MockType } from '../../../mock';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('Debio Conversion Service Unit Tests', () => {
  let debioConversionService: DebioConversionService;
  let httpServiceMock: MockType<HttpService>;
  const httpServiceMockFactory: () => MockType<HttpService> = jest.fn(
    () => ({
      get: jest.fn(),
    }),
  );
  
  const REDIS_STORE_URL = "URL";
  const REDIS_STORE_USERNAME = "REDIS_STORE_USERNAME";
  const REDIS_STORE_PASSWORD = "REDIS_STORE_PASSWORD";
  class ProcessEnvProxyMock {
    env = { REDIS_STORE_URL, REDIS_STORE_USERNAME, REDIS_STORE_PASSWORD };
  }

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DebioConversionService,
        ProcessEnvProxy,
        { provide: HttpService, useFactory: httpServiceMockFactory },
        // { provide: ProcessEnvProxy, useClass: ProcessEnvProxyMock },
      ],
    }).compile();

    debioConversionService = module.get(DebioConversionService);
    httpServiceMock = module.get(HttpService);
  });

  it('should be defined', () => {
    // Assert
    expect(debioConversionService).toBeDefined();
  });
  
  it('should get exchange', () => {
    // Arrange
    const EXPECTED_URL_PARAM = `${REDIS_STORE_URL}/cache`;
    const EXPECTED_AUTH_PARAM = {
        auth: {
            username: REDIS_STORE_USERNAME,
            password: REDIS_STORE_PASSWORD,
        },
    };
    const RESULT = 0;
    httpServiceMock.get.mockReturnValue(of(RESULT));
    
    // Assert
    expect(debioConversionService.getExchange()).resolves.toEqual(RESULT);
    expect(httpServiceMock.get).toHaveBeenCalled();
    expect(httpServiceMock.get).toHaveBeenCalledWith(EXPECTED_URL_PARAM, EXPECTED_AUTH_PARAM);
  });
});
