import { Test, TestingModule } from '@nestjs/testing';
import { DebioConversionService } from '../../../../../src/common';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { when } from 'jest-when';
import { config } from '../../../../../src/config';
jest.mock('axios');

describe('Debio Conversion Service Unit Tests', () => {
  let debioConversionService: DebioConversionService;
  let cacheManager: Cache;
  const axiosMock = new MockAdapter(axios);

  const COINMARKETCAP_HOST = config.COINMARKETCAP_HOST;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DebioConversionService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: () => jest.fn(),
            set: () => jest.fn(),
          },
        },
      ],
    }).compile();

    debioConversionService = module.get(DebioConversionService);
    cacheManager = module.get(CACHE_MANAGER);
    axiosMock.reset();
  });

  it('should be defined', () => {
    // Assert
    expect(debioConversionService).toBeDefined();
  });

  it('should get exchange', async () => {
    // Arrange
    const cacheManagerGetSpy = jest.spyOn(cacheManager, 'get');
    const RESULT = { res: 0 };
    const CALLED_WITH = 'exchange';

    when(cacheManagerGetSpy).calledWith(CALLED_WITH).mockReturnValue(RESULT);

    // Assert
    expect(await debioConversionService.getCacheExchange()).toEqual(RESULT);
    expect(cacheManager.get).toBeCalled();
    expect(cacheManager.get).toBeCalledWith(CALLED_WITH);
  });

  it('should get exchange from to', async () => {
    // Arrange
    const cacheManagerGetSpy = jest.spyOn(cacheManager, 'get');
    const FROM = 'USN';
    const TO = 'USDT';
    const RESULT = { res: 0 };
    const CALLED_WITH = `exchange${FROM}To${TO}`;

    when(cacheManagerGetSpy).calledWith(CALLED_WITH).mockReturnValue(RESULT);

    // Assert
    expect(
      await debioConversionService.getCacheExchangeFromTo(FROM, TO),
    ).toEqual(RESULT);
    expect(cacheManager.get).toBeCalled();
    expect(cacheManager.get).toBeCalledWith(CALLED_WITH);
  });

  it('should convert balance from to', async () => {
    // Arrange
    const httpGetSpy = jest.spyOn(axios, 'get');
    const RESULT = 1;
    const API_KEY = config.COINMARKETCAP_API_KEY;
    const BALANCE_AMOUNT = 1;
    const FROM = 'USN';
    const TO = 'USDT';

    const CONFIG = {
      headers: {
        'X-CMC_PRO_API_KEY': API_KEY,
      },
      params: {
        amount: BALANCE_AMOUNT,
        symbol: FROM,
        convert: TO,
      },
    };

    const RESULT_AXIOS_GET = {
      data: {
        data: [
          {
            quote: {
              USDT: {
                price: BALANCE_AMOUNT,
              },
            },
          },
        ],
      },
    };

    const HOST = `${COINMARKETCAP_HOST}/tools/price-conversion`;

    when(httpGetSpy).calledWith(HOST, CONFIG).mockReturnValue(RESULT_AXIOS_GET);

    // Assert
    expect(
      await debioConversionService.convertBalanceFromTo(
        API_KEY,
        BALANCE_AMOUNT,
        FROM,
        TO,
      ),
    ).toEqual(RESULT);
    expect(axios.get).toBeCalled();
    expect(axios.get).toBeCalledWith(HOST, CONFIG);
  });
});
