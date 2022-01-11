import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ServiceService } from '../../../../../src/endpoints/substrate-endpoint/services/service.service';
import { ServiceController } from '../../../../../src/endpoints/substrate-endpoint/services/service.controller';
import { elasticsearchServiceMockFactory, MockType } from '../../../mock';

describe('Substrate Indexer Service Controller Unit Tests', () => {
  let serviceControllerMock: ServiceController;
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
        ServiceController,
        ServiceService,
        { provide: ElasticsearchService, useFactory: elasticsearchServiceMockFactory }
      ],
    }).compile();

    serviceControllerMock = module.get(ServiceController);
    serviceServiceMock = module.get(ServiceService);
    elasticsearchServiceMock = module.get(ElasticsearchService);
  });

  it('should be defined', () => {
    // Assert
    expect(serviceControllerMock).toBeDefined();
  });

  it('should find service by country, city, and category', () => {
    // Arrange
    const serviceServiceSpy = jest.spyOn(serviceServiceMock, 'getByCountryCity');
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
    expect(serviceControllerMock.findByCountryCity({
      city: "XX",
      country: "XX",
    })).resolves.toEqual(RESULT);
    expect(serviceServiceSpy).toHaveBeenCalled();
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
    const serviceServiceSpy = jest.spyOn(serviceServiceMock, 'getByCountryCity');
    elasticsearchServiceMock.search.mockImplementationOnce(() => Promise.reject(ERROR_RESULT));

    // Assert
    expect(serviceControllerMock.findByCountryCity({
      city: "XX",
      country: "XX",
    })).resolves.toEqual(RESULT);
    expect(serviceServiceSpy).toHaveBeenCalled();
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
    const serviceServiceSpy = jest.spyOn(serviceServiceMock, 'getByCountryCity');
    elasticsearchServiceMock.search.mockImplementationOnce(() => Promise.reject(ERROR_RESULT))

    // Assert
    expect(serviceControllerMock.findByCountryCity({
      city: "XX",
      country: "XX",
    })).rejects.toMatchObject(ERROR_RESULT);
    expect(serviceServiceSpy).toHaveBeenCalled();
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });
});
