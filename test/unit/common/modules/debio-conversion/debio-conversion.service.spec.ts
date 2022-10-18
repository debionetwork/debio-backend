import { Test, TestingModule } from '@nestjs/testing';
import { DebioConversionService } from '../../../../../src/common';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { CACHE_MANAGER } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cache } from 'cache-manager';
import { when } from 'jest-when';

describe('Debio Conversion Service Unit Tests', () => {
  let debioConversionService: DebioConversionService;
  let cacheManager: Cache;
  let http: HttpService;
  const axiosMock = new MockAdapter(axios);

  const API_KEY_COINMARKETCAP = 'API_KEY_COINMARKETCAP';
  const SODAKI_HOST = 'SODAKI_HOST';
  const COINMARKETCAP_HOST = 'COINMARKETCAP_HOST';
  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['API_KEY_COINMARKETCAP', API_KEY_COINMARKETCAP],
      ['SODAKI_HOST', SODAKI_HOST],
      ['COINMARKETCAP_HOST', COINMARKETCAP_HOST],
    ]);
    loadSecrets() {
      return null;
    }

    getSecret(key) {
      return this._secretsList.get(key);
    }
  }

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DebioConversionService,
        {
          provide: GCloudSecretManagerService,
          useClass: GoogleSecretManagerServiceMock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: () => jest.fn(),
            set: () => jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: () => jest.fn(),
          }
        }
      ],
    }).compile();

    debioConversionService = module.get(DebioConversionService);
    cacheManager = module.get(CACHE_MANAGER);
    http = module.get(HttpService);
    axiosMock.reset();
  });

  it('should be defined', () => {
    // Assert
    expect(debioConversionService).toBeDefined();
  });

  it('should get exchange', async () => {
    // Arrange
    const cacheManagerGetSpy = jest.spyOn(cacheManager, 'get');
    const RESULT = {res: 0};
    const CALLED_WITH = "exchange";

    when(cacheManagerGetSpy)
      .calledWith(CALLED_WITH)
      .mockReturnValue(RESULT);

    // Assert
    expect(await debioConversionService.getCacheExchange()).toEqual(RESULT);
    expect(cacheManager.get).toBeCalled();
    expect(cacheManager.get).toBeCalledWith(CALLED_WITH);
  });

  it('should get exchange from to', async () => {
    // Arrange
    const cacheManagerGetSpy = jest.spyOn(cacheManager, 'get');
    const FROM = "USN";
    const TO = "USDT";
    const RESULT = {res: 0};
    const CALLED_WITH = `exchange${FROM}To${TO}`;

    when(cacheManagerGetSpy)
      .calledWith(CALLED_WITH)
      .mockReturnValue(RESULT);

    // Assert
    expect(await debioConversionService.getCacheExchangeFromTo(FROM, TO)).toEqual(RESULT);
    expect(cacheManager.get).toBeCalled();
    expect(cacheManager.get).toBeCalledWith(CALLED_WITH);
  });

  it('should convert balance from to', async () => {
    // Arrange
    const httpGetSpy = jest.spyOn(http, 'get');
    const RESULT = 1;
    const API_KEY = "KEY";
    const BALANCE_AMOUNT = 1;
    const FROM = "USN";
    const TO = "USDT";

    const HEADERS = {
      headers: {
        'X-CMC_PRO_API_KEY': API_KEY,
      }
    };

    const PARAMS = {
      params: {
        amount: BALANCE_AMOUNT,
        symbol: FROM,
        convert: TO,
      }
    }

    const HOST = `${COINMARKETCAP_HOST}/tools/price-conversion`;

    when(httpGetSpy)
      .calledWith(HOST, HEADERS, PARAMS)
      .mockReturnValue(RESULT);

    // Assert
    expect(await debioConversionService.convertBalanceFromTo(API_KEY, BALANCE_AMOUNT, FROM, TO)).toEqual(RESULT);
    expect(http.get).toBeCalled();
    expect(http.get).toBeCalledWith(HOST);
    expect(http.get).toBeCalledWith(HEADERS);
    expect(http.get).toBeCalledWith(PARAMS);
  });
});
