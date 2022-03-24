import { GeneticAnalysisOrderService } from '../../../../../src/endpoints/substrate-endpoint/services';
import {
  elasticsearchServiceMockFactory,
  MockType,
  substrateServiceMockFactory,
} from '../../../mock';
import { when } from 'jest-when';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { SubstrateService } from '../../../../../src/common';
import { setGeneticAnalysisOrderPaid } from '@debionetwork/polkadot-provider';

jest.mock('@debionetwork/polkadot-provider', () => ({
  setGeneticAnalysisOrderPaid: jest.fn(),
}));

describe('Substrate Indexer Genetic Analysis Service Unit Testing', () => {
  let geneticAnalysisOrderServiceMock: GeneticAnalysisOrderService;
  let substrateServiceMock: MockType<SubstrateService>;
  let elasticsearchServiceMock: MockType<ElasticsearchService>;

  const API = 'API';
  const PAIR = 'PAIR';

  const createSearchObject = (genetic_analysis_order_id: string) => {
    return {
      index: 'genetic-analysis-order',
      body: {
        query: {
          match: {
            _id: {
              query: genetic_analysis_order_id,
            },
          },
        },
      },
    };
  };

  const createSearchListObject = (size: number, page: number, hash_id: string, keyword: string, type: string) => {
    const filter_array = [];

    let match;
    const mustNot = [];
    switch (type) {
      case 'customer':
        match = { customer_id: hash_id };
        break;
      case 'analyst':
        match = { seller_id: hash_id };

        mustNot.push({
          match: { status: { query: 'Unpaid' } },
        });

        mustNot.push({
          match: { status: { query: 'Cancelled' } },
        });
        break;
      default:
        match = { customer_id: hash_id };
        break;
    }

    filter_array.push({
      bool: {
        must: [{ match: match }],
        must_not: mustNot,
      },
    });

    if (keyword && keyword.trim() !== '') {
      filter_array.push({
        bool: {
          should: [
            {
              match_phrase_prefix: {
                status: {
                  query: keyword,
                },
              },
            },
            {
              match_phrase_prefix: {
                genetic_analysis_tracking_id: {
                  query: keyword,
                },
              },
            },
          ],
        },
      });
    }

    const query = {
      bool: {
        filter: filter_array,
      },
    };

    const searchObj = {
      index: 'genetic-analysis-order',
      body: {
        query: query,
        sort: [
          {
            'created_at.keyword': {
              unmapped_type: 'keyword',
              order: 'desc',
            },
          },
        ],
      },
      from: size * page - size || 0,
      size: size || 10,
    };

    return { query, searchObj };
  }

  //Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneticAnalysisOrderService,
        {
          provide: ElasticsearchService,
          useFactory: elasticsearchServiceMockFactory,
        },
        {
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory,
        },
      ],
    }).compile();

    geneticAnalysisOrderServiceMock = module.get(GeneticAnalysisOrderService);
    substrateServiceMock = module.get(SubstrateService);
    elasticsearchServiceMock = module.get(ElasticsearchService);
    Reflect.set(substrateServiceMock, 'api', API);
    Reflect.set(substrateServiceMock, 'pair', PAIR);

    (setGeneticAnalysisOrderPaid as jest.Mock).mockClear();
  });

  it('should be defined', () => {
    //Assert
    expect(geneticAnalysisOrderServiceMock).toBeDefined();
  });

  it('should be called genetic analysis order paid', async () => {
    const genetic_analyst_order_id = 'XX';

    await geneticAnalysisOrderServiceMock.geneticAnalysisSetOrderPaid(
      genetic_analyst_order_id,
    );

    expect(setGeneticAnalysisOrderPaid).toHaveBeenCalledTimes(1);
    expect(setGeneticAnalysisOrderPaid).toHaveBeenCalledWith(
      API,
      PAIR,
      genetic_analyst_order_id,
    );
  });

  it('should be called genetic analysis order by id', async () => {
    const genetic_analyst_order_id = 'XX';
    const CALLED_WITH = createSearchObject(genetic_analyst_order_id);
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
    expect(geneticAnalysisOrderServiceMock.getGeneticAnalysisOrderById(genetic_analyst_order_id)).resolves.toEqual(RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should return empty', () => {
    //Arrange
    const genetic_analyst_order_id = 'XX';
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
    expect(geneticAnalysisOrderServiceMock.getGeneticAnalysisOrderById(genetic_analyst_order_id)).resolves.toEqual(RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should throw error', () => {
    //Arrange
    const genetic_analyst_order_id = 'XX';
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
    expect(geneticAnalysisOrderServiceMock.getGeneticAnalysisOrderById(genetic_analyst_order_id)).rejects.toMatchObject(
      ERROR_RESULT,
    );
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should be called genetic analysis order list', async () => {
    const genetic_analyst_order_id = 'XX';
    const type = 'customer';
    const keyword = 'XX';
    const size = 10;
    const page = 1;
    const CALLED_WITH = createSearchListObject(size, page, genetic_analyst_order_id, keyword, type);
    const RESULT = [];
    const RESULT_COUNT = 1;
    const RESULT_PAGE = 1;
    const ES_RESULT = {
      body: {
        hits: {
          hits: RESULT,
        },
      },
    };
    const ES_RESULT_COUNT = {
      body: {
        count: RESULT_COUNT,
      },
    };
    const FUNCTION_RESULT = {
      info: {
        page: RESULT_PAGE,
        count: RESULT_COUNT,
      },
      data: RESULT,
    };

    when(elasticsearchServiceMock.search)
      .calledWith(CALLED_WITH.searchObj)
      .mockReturnValue(ES_RESULT);

    when(elasticsearchServiceMock.count)
      .calledWith({
        index: 'genetic-analysis-order',
        body: {
          query: CALLED_WITH.query,
        },
      })
      .mockReturnValue(ES_RESULT_COUNT);

    //Assert
    expect(await geneticAnalysisOrderServiceMock.getGeneticAnalysisOrderList(type, genetic_analyst_order_id, keyword, page, size)).toEqual(FUNCTION_RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });
});
