import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { LabService } from '../../../../../src/endpoints/substrate-endpoint/services/lab.service';
import { LabController } from '../../../../../src/endpoints/substrate-endpoint/labs/lab.controller';
import { elasticsearchServiceMockFactory, MockType } from '../../../mock';

describe('Substrate Indexer Lab Controller Unit Tests', () => {
  let labControllerMock: LabController;
  let labServiceMock: LabService;
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
    return {
      index: 'labs',
      body: {
        query: {
          bool: {
            must: [
              {
                match_phrase_prefix: { 'services.country': { query: country } },
              },
              { match_phrase_prefix: { 'services.region': { query: region } } },
              { match_phrase_prefix: { 'services.city': { query: city } } },
              {
                match_phrase_prefix: {
                  'services.info.category': { query: category },
                },
              },
              {
                match_phrase_prefix: {
                  'services.service_flow': { query: service_flow },
                },
              },
            ],
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
        LabController,
        LabService,
        {
          provide: ElasticsearchService,
          useFactory: elasticsearchServiceMockFactory,
        },
      ],
    }).compile();

    labControllerMock = module.get(LabController);
    labServiceMock = module.get(LabService);
    elasticsearchServiceMock = module.get(ElasticsearchService);
  });

  it('should be defined', () => {
    // Assert
    expect(labControllerMock).toBeDefined();
  });

  it('should find lab by country, city, and category', () => {
    // Arrange
    const labServiceSpy = jest.spyOn(
      labServiceMock,
      'getByCountryCityCategory',
    );
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
                  category: 'XX',
                },
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

    const RESULT = {
      result: [
        {
          lab_id: 'ID',
          info: {
            category: 'XX',
          },
          lab_detail: {
            category: 'XX',
          },
          certifications: 'cert',
          verification_status: false,
          service_flow: false,
          blockMetaData: 1,
        },
      ],
    };

    // Assert
    expect(
      labControllerMock.findByCountryCityCategory(
        'XX',
        'XX',
        'XX',
        'XX',
        false,
        1,
        10,
      ),
    ).resolves.toEqual(RESULT);
    expect(labServiceSpy).toHaveBeenCalled();
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
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
    const labServiceSpy = jest.spyOn(
      labServiceMock,
      'getByCountryCityCategory',
    );
    elasticsearchServiceMock.search.mockImplementationOnce(() =>
      Promise.reject(ERROR_RESULT),
    );

    // Assert
    expect(
      labControllerMock.findByCountryCityCategory(
        'XX',
        'XX',
        'XX',
        'XX',
        false,
        1,
        10,
      ),
    ).resolves.toEqual({
      result: RESULT,
    });
    expect(labServiceSpy).toHaveBeenCalled();
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
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
    const labServiceSpy = jest.spyOn(
      labServiceMock,
      'getByCountryCityCategory',
    );
    elasticsearchServiceMock.search.mockImplementationOnce(() =>
      Promise.reject(ERROR_RESULT),
    );

    // Assert
    expect(
      labControllerMock.findByCountryCityCategory(
        'XX',
        'XX',
        'XX',
        'XX',
        false,
        1,
        10,
      ),
    ).rejects.toMatchObject(ERROR_RESULT);
    expect(labServiceSpy).toHaveBeenCalled();
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });
});
