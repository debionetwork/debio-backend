import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  countryServiceMockFactory,
  debioConversionServiceMockFactory,
  elasticsearchServiceMockFactory,
  MockType,
} from '../../../mock';
import { ServiceRequestService } from '../../../../../src/endpoints/substrate-endpoint/services';
import { CountryService } from '../../../../../src/endpoints/location/country.service';
import { DebioConversionService } from '../../../../../src/common/modules/debio-conversion/debio-conversion.service';

describe('Substrate Indexer Lab Service Unit Tests', () => {
  let serviceRequestService: ServiceRequestService;
  let elasticsearchServiceMock: MockType<ElasticsearchService>;
  let countryServiceMock: MockType<CountryService>;
  let exchangeCacheService: MockType<DebioConversionService>;

  const createObjectSearchAggregatedByCountries = (
    page?: number,
    size?: number,
  ) => {
    return {
      index: 'country-service-request',
      body: {
        from: page ? (page - 1) * size : 0,
        size: size ? size : 10000,
        sort: [
          {
            'country.keyword': {
              unmapped_type: 'keyword',
              order: 'asc',
            },
          },
        ],
      },
    };
  };

  const createObjectSearchByCustomerId = (
    customerId: string,
    page: number,
    size: number,
  ) => {
    return {
      index: 'create-service-request',
      body: {
        query: {
          bool: {
            must: [
              {
                match_phrase_prefix: {
                  'request.requester_address': { query: customerId },
                },
              },
            ],
          },
        },
      },
      from: size * page - size || 0,
      size: size || 10,
    };
  };

  const createObjectSearchProvideRequestService = (
    country: string,
    region: string,
    city: string,
    category: string,
  ) => {
    return {
      index: 'create-service-request',
      body: {
        query: {
          bool: {
            must: [
              {
                match_phrase_prefix: { 'request.country': { query: country } },
              },
              { match_phrase_prefix: { 'request.region': { query: region } } },
              { match_phrase_prefix: { 'request.city': { query: city } } },
              {
                match_phrase_prefix: {
                  'request.service_category': { query: category },
                },
              },
              { match_phrase_prefix: { 'request.status': { query: 'Open' } } },
            ],
          },
        },
      },
    };
  };

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceRequestService,
        {
          provide: ElasticsearchService,
          useFactory: elasticsearchServiceMockFactory,
        },
        {
          provide: CountryService,
          useFactory: countryServiceMockFactory,
        },
        {
          provide: DebioConversionService,
          useFactory: debioConversionServiceMockFactory,
        },
      ],
    }).compile();

    serviceRequestService = module.get(ServiceRequestService);
    elasticsearchServiceMock = module.get(ElasticsearchService);
    countryServiceMock = module.get(CountryService);
    exchangeCacheService = module.get(DebioConversionService);
  });

  it('should be defined', () => {
    // Assert
    expect(serviceRequestService).toBeDefined();
  });

  it('should get aggregated by countries return array empty', async () => {
    // Arrange
    const ES_CALLED_WITH = createObjectSearchAggregatedByCountries(1, 10);
    const RESULT = [];
    const EXPECTED_RESULT = [];
    const ES_RESULT = {
      body: {
        hits: {
          hits: RESULT,
        },
      },
    };

    const EXCHANCE_RESULT = {
      dbioToDai: 1,
      dbioToUsd: 1,
    };

    when(elasticsearchServiceMock.search)
      .calledWith(ES_CALLED_WITH)
      .mockReturnValue(ES_RESULT);

    exchangeCacheService.getExchange.mockReturnValue(EXCHANCE_RESULT);

    // Assert
    expect(
      await serviceRequestService.getAggregatedByCountries(1, 10),
    ).toMatchObject(EXPECTED_RESULT);
    expect(exchangeCacheService.getExchange).toHaveBeenCalled();
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should get aggregated by countries return array object', async () => {
    // Arrange
    const ID = 'XX';
    const COUNTRY = 'XX';
    const REGION = 'XX';
    const CITY = 'XX';
    const REQUESTER = 'XX';
    const CATEGORY = 'XX';
    const COUNTRY_NAME = 'string';
    const ES_CALLED_WITH = createObjectSearchAggregatedByCountries(1, 10);
    const RESULT = [
      {
        _source: {
          country: COUNTRY,
          service_request: [
            {
              id: ID,
              region: REGION,
              city: CITY,
              requester: REQUESTER,
              category: CATEGORY,
              amount: '1',
            },
          ],
        },
      },
    ];
    const ES_RESULT = {
      body: {
        hits: {
          hits: RESULT,
        },
      },
    };

    const EXCHANCE_RESULT = {
      dbioToDai: 1,
      dbioToUsd: 1,
    };

    const RETURN_COUNTRY_SERVICE = {
      iso2: COUNTRY,
      name: COUNTRY_NAME,
    };

    const EXPECTED_RESULT = [{}];

    when(elasticsearchServiceMock.search)
      .calledWith(ES_CALLED_WITH)
      .mockReturnValue(ES_RESULT);

    when(countryServiceMock.getByIso2Code)
      .calledWith(COUNTRY)
      .mockReturnValue(RETURN_COUNTRY_SERVICE);

    exchangeCacheService.getExchange.mockReturnValue(EXCHANCE_RESULT);

    // Assert
    expect(
      await serviceRequestService.getAggregatedByCountries(1, 10),
    ).toMatchObject(EXPECTED_RESULT);
    expect(exchangeCacheService.getExchange).toHaveBeenCalled();
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
    expect(countryServiceMock.getByIso2Code).toHaveBeenCalled();
  });

  it('should get aggregated by countries return array empty by index_not_found_exception', async () => {
    // Arrange
    const EXPECTED_RESULT = [];
    const ERROR_RESULT = {
      body: {
        error: {
          type: 'index_not_found_exception',
        },
      },
    };

    const EXCHANCE_RESULT = {
      dbioToDai: 1,
      dbioToUsd: 1,
    };

    elasticsearchServiceMock.search.mockImplementationOnce(() =>
      Promise.reject(ERROR_RESULT),
    );

    exchangeCacheService.getExchange.mockReturnValue(EXCHANCE_RESULT);

    // Assert
    expect(
      await serviceRequestService.getAggregatedByCountries(1, 10),
    ).toMatchObject(EXPECTED_RESULT);
    expect(exchangeCacheService.getExchange).toHaveBeenCalled();
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should throw error get aggregated by countries', async () => {
    // Arrange
    const ERROR_RESULT = {
      body: {
        error: {
          type: 'failed',
        },
      },
    };
    elasticsearchServiceMock.search.mockImplementationOnce(() =>
      Promise.reject(ERROR_RESULT),
    );

    const EXCHANCE_RESULT = {
      dbioToDai: 1,
      dbioToUsd: 1,
    };

    elasticsearchServiceMock.search.mockImplementationOnce(() =>
      Promise.reject(ERROR_RESULT),
    );

    exchangeCacheService.getExchange.mockReturnValue(EXCHANCE_RESULT);

    // Assert
    expect(
      serviceRequestService.getAggregatedByCountries(1, 10),
    ).rejects.toMatchObject(ERROR_RESULT);
    expect(exchangeCacheService.getExchange).toHaveBeenCalled();
    await Promise.resolve();
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should get by customer id', () => {
    // Arrange
    const CUSTOMER_ID = 'XX';
    const PAGE = 1;
    const SIZE = 10;
    const RESULT = [];
    const ERROR_RESULT = {
      body: {
        error: {
          type: 'index_not_found_exception',
        },
      },
    };
    elasticsearchServiceMock.search.mockImplementationOnce(() =>
      Promise.reject(ERROR_RESULT),
    );

    // Assert
    expect(
      serviceRequestService.getByCustomerId(CUSTOMER_ID, PAGE, SIZE),
    ).resolves.toMatchObject(RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should get by customer id return array empty', () => {
    // Arrange
    const CUSTOMER_ID = 'XX';
    const PAGE = 1;
    const SIZE = 10;
    const CALLED_WITH = createObjectSearchByCustomerId(CUSTOMER_ID, PAGE, SIZE);
    const RESULT = [
      {
        _source: {},
      },
    ];
    const EXPECTED_RESULT = [{}];
    const ES_RESULT = {
      body: {
        hits: {
          hits: RESULT,
        },
      },
    };

    when(elasticsearchServiceMock.search)
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);

    // Assert
    expect(
      serviceRequestService.getByCustomerId(CUSTOMER_ID, PAGE, SIZE),
    ).resolves.toMatchObject(EXPECTED_RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should throw error get by customer id', () => {
    // Arrange
    const CUSTOMER_ID = 'XX';
    const PAGE = 1;
    const SIZE = 10;
    const ERROR_RESULT = {
      body: {
        error: {
          type: 'failed',
        },
      },
    };
    elasticsearchServiceMock.search.mockImplementationOnce(() =>
      Promise.reject(ERROR_RESULT),
    );

    // Assert
    expect(
      serviceRequestService.getByCustomerId(CUSTOMER_ID, PAGE, SIZE),
    ).rejects.toMatchObject(ERROR_RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should provide request service', () => {
    // Arrange
    const COUNTRY = 'XX';
    const REGION = 'XX';
    const CITY = 'XX';
    const CATEGORY = 'XX';
    const CALLED_WITH = createObjectSearchProvideRequestService(
      COUNTRY,
      REGION,
      CITY,
      CATEGORY,
    );
    const RESULT = [
      {
        _source: {},
      },
    ];
    const EXPECTED_RESULT = [{}];
    const ES_RESULT = {
      body: {
        hits: {
          hits: RESULT,
        },
      },
    };

    when(elasticsearchServiceMock.search)
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);

    // Assert
    expect(
      serviceRequestService.provideRequestService(
        COUNTRY,
        REGION,
        CITY,
        CATEGORY,
      ),
    ).resolves.toMatchObject(EXPECTED_RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should provide request service return array empty', () => {
    // Arrange
    const COUNTRY = 'XX';
    const REGION = 'XX';
    const CITY = 'XX';
    const CATEGORY = 'XX';
    const RESULT = [];
    const ERROR_RESULT = {
      body: {
        error: {
          type: 'index_not_found_exception',
        },
      },
    };
    elasticsearchServiceMock.search.mockImplementationOnce(() =>
      Promise.reject(ERROR_RESULT),
    );

    // Assert
    expect(
      serviceRequestService.provideRequestService(
        COUNTRY,
        REGION,
        CITY,
        CATEGORY,
      ),
    ).resolves.toMatchObject(RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should throw error provide request service', () => {
    // Arrange
    const COUNTRY = 'XX';
    const REGION = 'XX';
    const CITY = 'XX';
    const CATEGORY = 'XX';
    const ERROR_RESULT = {
      body: {
        error: {
          type: 'failed',
        },
      },
    };
    elasticsearchServiceMock.search.mockImplementationOnce(() =>
      Promise.reject(ERROR_RESULT),
    );

    // Assert
    expect(
      serviceRequestService.provideRequestService(
        COUNTRY,
        REGION,
        CITY,
        CATEGORY,
      ),
    ).rejects.toMatchObject(ERROR_RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });
});
