import { Test, TestingModule } from '@nestjs/testing';
import {
  ProcessEnvProxy,
  DebioConversionService,
} from '../../../../../src/common';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';

describe('Debio Conversion Service Unit Tests', () => {
  let debioConversionService: DebioConversionService;
  const axiosMock = new MockAdapter(axios);

  const REDIS_STORE_URL = 'URL';
  const REDIS_STORE_USERNAME = 'REDIS_STORE_USERNAME';
  const REDIS_STORE_PASSWORD = 'REDIS_STORE_PASSWORD';
  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['REDIS_STORE_USERNAME', REDIS_STORE_USERNAME],
      ['REDIS_STORE_PASSWORD', REDIS_STORE_PASSWORD],
    ]);
    loadSecrets() {
      return null;
    }

    getSecret(key) {
      return this._secretsList.get(key);
    }
  }

  class ProcessEnvProxyMock {
    env = { REDIS_STORE_URL };
  }

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DebioConversionService,
        { provide: ProcessEnvProxy, useClass: ProcessEnvProxyMock },
        {
          provide: GCloudSecretManagerService,
          useClass: GoogleSecretManagerServiceMock,
        },
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
