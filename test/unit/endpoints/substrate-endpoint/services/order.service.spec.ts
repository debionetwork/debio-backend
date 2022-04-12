import { ElasticsearchService } from '@nestjs/elasticsearch';
import { when } from 'jest-when';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../../../../../src/endpoints/substrate-endpoint/services';
import { elasticsearchServiceMockFactory, MockType } from '../../../mock';

describe('Substrate Indexer Order Service Unit Tests', () => {
  let orderServiceMock: OrderService;
  let elasticsearchServiceMock: MockType<ElasticsearchService>;

  const createSearchObject = (hash_id: string) => {
    return {
      index: ['orders', 'genetic-analysis-order'],
      body: {
        query: {
          match: {
            _id: {
              query: hash_id,
            },
          },
        },
      },
    };
  };

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: ElasticsearchService,
          useFactory: elasticsearchServiceMockFactory,
        },
      ],
    }).compile();

    orderServiceMock = module.get(OrderService);
    elasticsearchServiceMock = module.get(ElasticsearchService);
  });

  it('should be defined', () => {
    //assert
    expect(orderServiceMock).toBeDefined();
  });

  it('should find order by hash id', () => {
    // Arrange
    const CALLED_WITH = createSearchObject('XX');
    const RESULT = {};
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

    //Assert
    expect(orderServiceMock.getOrderByHashId('XX')).resolves.toEqual(RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should return empty', () => {
    //Arrange
    const RESULT = {};
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

    //Assert
    expect(orderServiceMock.getOrderByHashId('XX')).resolves.toEqual(RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should throw error', () => {
    //Arrange
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

    //Assert
    expect(orderServiceMock.getOrderByHashId('XX')).rejects.toMatchObject(
      ERROR_RESULT,
    );
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });
});
