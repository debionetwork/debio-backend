import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ServiceService } from '../../../../../src/endpoints/substrate-endpoint/services/service.service';
import { elasticsearchServiceMockFactory, MockType } from '../../../mock';

describe('Substrate Indexer Service Service Unit Tests', () => {
  let serviceServiceMock: ServiceService;
  let elasticsearchServiceMock: MockType<ElasticsearchService>;

  const createSearchObject = (
    country: string,
    city: string,
  ) => {
    return {
      index: 'services',
      body: {
        query: {
          bool: {
            filter: [{ match: { country } }, { match: { city } }],
          },
        },
      },
    }
  }
  
  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceService,
        { provide: ElasticsearchService, useFactory: elasticsearchServiceMockFactory }
      ],
    }).compile();

    serviceServiceMock = module.get(ServiceService);
    elasticsearchServiceMock = module.get(ElasticsearchService);
  });

  it('should be defined', () => {
    // Assert
    expect(serviceServiceMock).toBeDefined();
  });

  it('should find service by country, city, and category', () => {
    // Arrange
    const CALLED_WITH = createSearchObject(
        "XX",
        "XX",
    );
    const RESULT = [1];
    const ES_RESULT = {
      body: {
        hits: {
          hits: RESULT
        }
      }
    };
    when(elasticsearchServiceMock.search).calledWith(CALLED_WITH).mockReturnValue(ES_RESULT);

    // Assert
    expect(serviceServiceMock.getByCountryCity(
        "XX",
        "XX"
    )).resolves.toEqual(RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should return empty', () => {
    // Arrange
    const RESULT = [];
    const ERROR_RESULT = {
      body : {
        error: {
          type: 'index_not_found_exception'
        }
      }
    };
    elasticsearchServiceMock.search.mockImplementationOnce(() => Promise.reject(ERROR_RESULT));

    // Assert
    expect(serviceServiceMock.getByCountryCity(
        "XX",
        "XX"
    )).resolves.toEqual(RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should throw error', () => {
    // Arrange
    const ERROR_RESULT = {
      body : {
        error: {
          type: 'failed'
        }
      }
    };
    elasticsearchServiceMock.search.mockImplementationOnce(() => Promise.reject(ERROR_RESULT));

    // Assert
    expect(serviceServiceMock.getByCountryCity(
      "XX",
      "XX"
    )).rejects.toMatchObject(ERROR_RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });
});
