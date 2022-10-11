import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { LabService } from '../../../../../src/endpoints/substrate-endpoint/services/lab.service';
import { CountryService } from '../../../../../src/endpoints/location/country.service';
import { StateService } from '../../../../../src/endpoints/location/state.service';
import { countryServiceMockFactory, elasticsearchServiceMockFactory, MockType, stateServiceMockFactory } from '../../../mock';

describe('Substrate Indexer Lab Service Unit Tests', () => {
  let labServiceMock: LabService;
  let countryServiceMock: CountryService;
  let stateServiceMock: StateService;
  let elasticsearchServiceMock: MockType<ElasticsearchService>;

  const createSearchObject = (
    country: string,
    region: string,
    city: string,
    category: string,
    service_flow: boolean,
    page: number,
    size: number,
  ) => {
    const searchMustList: Array<any> = [
      {
        match_phrase_prefix: { 'info.country': { query: country } },
      },
    ];

    if (region !== undefined && region !== null && region.trim() !== '') {
      searchMustList.push({
        match_phrase_prefix: { 'info.region': { query: region } },
      });
    }

    if (city !== undefined && city !== null && city.trim() !== '') {
      searchMustList.push({
        match_phrase_prefix: { 'info.city': { query: city } },
      });
    }

    return {
      index: 'labs',
      body: {
        query: {
          bool: {
            must: searchMustList,
          },
        },
      },
      from: (size * page - size) | 0,
      size: size | 10,
    };
  };

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabService,
        {
          provide: CountryService,
          useFactory: countryServiceMockFactory,
        },
        {
          provide: StateService,
          useFactory: stateServiceMockFactory,
        },
        {
          provide: ElasticsearchService,
          useFactory: elasticsearchServiceMockFactory,
        },
      ],
    }).compile();

    labServiceMock = module.get(LabService);
    countryServiceMock = module.get(CountryService);
    stateServiceMock = module.get(StateService);
    elasticsearchServiceMock = module.get(ElasticsearchService);
  });

  it('should be defined', () => {
    // Assert
    expect(labServiceMock).toBeDefined();
  });

  it('should return empty', () => {
    // Arrange
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
      labServiceMock.getByCountryCityCategory('XX', 'XX', 'XX', 'XX', 1, 10),
    ).resolves.toEqual({
      result: RESULT,
    });
  });

  it('should throw error', () => {
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

    // Assert
    expect(
      labServiceMock.getByCountryCityCategory('XX', 'XX', 'XX', 'XX', 1, 10),
    ).rejects.toMatchObject(ERROR_RESULT);
  });

  it('should find lab by country, city, and category', async () => {
    const COUNTRY = "XX";
    const REGION = "XX";
    const CITY = "XX";
    const CATEGORY = "XX";

    const COUNTRY_NAME = "XX";
    const REGION_NAME = "XX";
    // Arrange
    const CALLED_WITH = createSearchObject(
      'XX',
      'XX',
      'XX',
      'XX',
      false,
      1,
      10,
    );
    const ES_RESULT = {
      body: {
        hits: {
          hits: [
            {
              _source: {
                certifications: 'cert',
                verification_status: false,
                blockMetaData: 1,
                account_id: 'ID',
                info: {
                  region: 'XX',
                  category: 'XX',
                },
                stake_amount: '20',
                stake_status: 'string',
                unstake_at: 'string',
                retrieve_unstake_at: 'string',
                services: [
                  {
                    info: {
                      category: 'XX',
                    },
                    service_flow: false,
                  },
                ],
              },
            },
          ],
        },
      },
    };
    when(elasticsearchServiceMock.search)
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);
    when(countryServiceMock.getByIso2Code)
      .calledWith(COUNTRY)
      .mockReturnValue({name: COUNTRY_NAME});
    when(stateServiceMock.getState)
      .calledWith(COUNTRY, REGION)
      .mockReturnValue({name: REGION_NAME});

    const RESULT = {
      result: [
        {
          lab_id: 'ID',
          info: {
            category: 'XX',
          },
          stake_amount: '20',
          stake_status: 'string',
          unstake_at: 'string',
          retrieve_unstake_at: 'string',
          lab_detail: {
            category: 'XX',
            region: 'XX'
          },
          certifications: 'cert',
          verification_status: false,
          service_flow: false,
          blockMetaData: 1,
          country_name: COUNTRY_NAME,
          region_name: REGION_NAME,
        },
      ],
    };

    // Assert
    expect(
      await labServiceMock.getByCountryCityCategory(
        COUNTRY,
        REGION,
        CITY,
        CATEGORY,
        1,
        10,
      ),
    ).toEqual(RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should find lab by country', async () => {
    const COUNTRY = "XX";
    const REGION = "XX";

    const COUNTRY_NAME = "XX";
    const REGION_NAME = "XX";
    // Arrange
    const CALLED_WITH = createSearchObject(
      'XX',
      null,
      null,
      null,
      false,
      1,
      10,
    );
    const ES_RESULT = {
      body: {
        hits: {
          hits: [
            {
              _source: {
                certifications: 'cert',
                verification_status: false,
                blockMetaData: 1,
                account_id: 'ID',
                info: {
                  region: 'XX',
                  category: 'XX',
                },
                stake_amount: '20',
                stake_status: 'string',
                unstake_at: 'string',
                retrieve_unstake_at: 'string',
                services: [
                  {
                    info: {
                      category: 'XX',
                    },
                    service_flow: false,
                  },
                ],
              },
            },
          ],
        },
      },
    };
    when(elasticsearchServiceMock.search)
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);
    when(countryServiceMock.getByIso2Code)
      .calledWith(COUNTRY)
      .mockReturnValue({name: COUNTRY_NAME});
    when(stateServiceMock.getState)
      .calledWith(COUNTRY, REGION)
      .mockReturnValue({name: REGION_NAME});

    const RESULT = {
      result: [
        {
          lab_id: 'ID',
          info: {
            category: 'XX',
          },
          stake_amount: '20',
          stake_status: 'string',
          unstake_at: 'string',
          retrieve_unstake_at: 'string',
          lab_detail: {
            category: 'XX',
            region: 'XX'
          },
          certifications: 'cert',
          verification_status: false,
          service_flow: false,
          blockMetaData: 1,
          country_name: COUNTRY_NAME,
          region_name: REGION_NAME
        },
      ],
    };

    // Assert
    expect(
      await labServiceMock.getByCountryCityCategory(
        COUNTRY,
        null,
        null,
        null,
        1,
        10,
      ),
    ).toEqual(RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });
});
