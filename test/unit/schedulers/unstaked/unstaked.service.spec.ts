import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { elasticsearchServiceMockFactory, MockType } from '../../mock';
import { UnstakedService } from '../../../../src/schedulers/unstaked/unstaked.service';
import {
  SubstrateService,
} from '../../../../src/common';
import { when } from 'jest-when';

describe('UnstakedService', () => {
  let unstakedService: UnstakedService;
  let elasticsearchServiceMock: MockType<ElasticsearchService>;
  let substrateServiceMock: MockType<SubstrateService>;
  
  const createSearchObject = () => {
    return {
      index: 'create-service-request',
      allow_no_indices: true,
      body: {
        query: {
          match: {
            'request.status': {
              query: 'WaitingForUnstaked',
            },
          },
        },
        sort: [
          {
            'request.unstaked_at.keyword': {
              unmapped_type: 'keyword',
              order: 'asc',
            },
          },
        ],
      },
      from: 0,
      size: 10,
    }
  };

  const substrateServiceMockFactory: () => MockType<SubstrateService> =
    jest.fn(() => ({
      api: jest.fn(),
      pair: jest.fn(),
      startListen: jest.fn(),
      stopListen: jest.fn()
    }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnstakedService,
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

    unstakedService = module.get(UnstakedService);
    elasticsearchServiceMock = module.get(ElasticsearchService);
    substrateServiceMock = module.get(SubstrateService);

    await module.init();
  });

  it('should be defined', () => {
    expect(unstakedService).toBeDefined();
  });

  it('should throw elasticsearch client error', () => {
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
    
    unstakedService.handleWaitingUnstaked();
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should called elasticsearchservice update', async () => {
    const queryServiceRequestByIdSpy = jest.spyOn(unstakedService, 'getServiceRequestDetail');

    const CALLED_WITH = createSearchObject();
    const REQUEST_ID = 'string';
    const ES_RESULT = {
      body: {
        hits: {
          hits: [
            {
              _source: {
                request: {
                  hash: REQUEST_ID,
                  unstaked_at: new Date().getTime().toString()
                }
              },
            },
          ],
        },
      },
    };
    const SUBSTRATE_RESULT = {
      status: 'Unstaked',
      unstaked_at: 'string'
    }

    when(queryServiceRequestByIdSpy)
      .calledWith(REQUEST_ID)
      .mockReturnValue(SUBSTRATE_RESULT);
    
    when(elasticsearchServiceMock.search)
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);
    
    unstakedService.handleWaitingUnstaked();
    await Promise.resolve();
    expect(queryServiceRequestByIdSpy).toHaveBeenCalled();
    await Promise.resolve();
    expect(elasticsearchServiceMock.update).toHaveBeenCalled();
    queryServiceRequestByIdSpy.mockRestore();
  });

  it('should called unstakedServiceRequest', async () => {
    const queryServiceRequestByIdSpy = jest.spyOn(unstakedService, 'getServiceRequestDetail');
    const unstakedServiceRequest = jest.spyOn(unstakedService, 'unstakedServiceRequest');

    const CALLED_WITH = createSearchObject();
    const REQUEST_ID = 'string';
    const SIX_DAYS = 6 * 24 * 60 * 60 * 1000;
    const ES_RESULT = {
      body: {
        hits: {
          hits: [
            {
              _source: {
                request: {
                  hash: REQUEST_ID,
                  unstaked_at: (new Date().getTime() - SIX_DAYS).toString()
                }
              },
            },
          ],
        },
      },
    };
    const SUBSTRATE_RESULT = {
      status: 'WaitingForUnstaked',
      unstaked_at: 'string'
    }

    when(queryServiceRequestByIdSpy)
      .calledWith(REQUEST_ID)
      .mockReturnValue(SUBSTRATE_RESULT);
    
    when(elasticsearchServiceMock.search.mockReturnValue(ES_RESULT))
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);
    
    unstakedService.handleWaitingUnstaked();
    await Promise.resolve();
    expect(queryServiceRequestByIdSpy).toHaveBeenCalled();
    await Promise.resolve();
    expect(unstakedServiceRequest).toHaveBeenCalled();
    queryServiceRequestByIdSpy.mockRestore();
    unstakedServiceRequest.mockRestore();
  });
});
