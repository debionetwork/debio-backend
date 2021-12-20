import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { LabService } from '../../../../src/substrate-indexed-data/labs/lab.service';
import { elasticsearchServiceMockFactory, MockType } from '../../mock';

describe('Substrate Indexer Lab Service Unit Tests', () => {
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
  }
  
    // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabService,
        { provide: ElasticsearchService, useFactory: elasticsearchServiceMockFactory }
      ],
    }).compile();

    labServiceMock = module.get(LabService);
    elasticsearchServiceMock = module.get(ElasticsearchService);
  });

  it('should be defined', () => {
    // Assert
    expect(labServiceMock).toBeDefined();
  });

  it('should find lab by country, city, and category', () => {
    // Arrange
    const CALLED_WITH = createSearchObject(
        "XX",
        "XX",
        "XX",
        "XX",
        false,
        1,
        10
    );
    const RESULT = [1];
    when(elasticsearchServiceMock.search).calledWith(CALLED_WITH).mockReturnValue(RESULT);

    // Assert
    expect(labServiceMock.getByCountryCityCategory(
        "XX",
        "XX",
        "XX",
        "XX",
        false,
        1,
        10
    )).resolves.toEqual(RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should return empty', () => {
    // Arrange
    const RESULT = [];
    elasticsearchServiceMock.search.mockImplementationOnce(() => Promise.reject({
      error: {
        body : {
          error: {
            type: 'index_not_found_exception'
          }
        }
      }
    }));

    // Assert
    expect(labServiceMock.getByCountryCityCategory(
        "XX",
        "XX",
        "XX",
        "XX",
        false,
        1,
        10
    )).resolves.toEqual(RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should throw error', () => {
    // Arrange
    const ERROR_RESULT = "ERR";
    elasticsearchServiceMock.search.mockImplementationOnce(() => Promise.reject());

    // Assert
    expect(labServiceMock.getByCountryCityCategory(
        "XX",
        "XX",
        "XX",
        "XX",
        false,
        1,
        10
    )).resolves.toThrowError(ERROR_RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });
});
