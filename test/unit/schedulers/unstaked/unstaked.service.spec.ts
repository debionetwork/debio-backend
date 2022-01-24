import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { elasticsearchServiceMockFactory, substrateServiceMockFactory, MockType, MockLogger } from '../../mock';
import { UnstakedService } from '../../../../src/schedulers/unstaked/unstaked.service';
import { ServiceRequest, SubstrateService } from '../../../../src/common';

import * as serviceRequestQuery from '../../../../src/common/polkadot-provider/query/service-request';
import * as serviceRequestCommand from '../../../../src/common/polkadot-provider/command/service-request';
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
    };
  };

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
    module.useLogger(MockLogger);
    
    unstakedService = module.get(UnstakedService);
    elasticsearchServiceMock = module.get(ElasticsearchService);
    substrateServiceMock = module.get(SubstrateService);
  });

  it('should be defined', () => {
    expect(unstakedService).toBeDefined();
  });

  it('should not do anything', () => {
    const queryServiceRequestMock = jest.spyOn(
      serviceRequestQuery,
      'queryServiceRequestById',
    );
    const retrieveUnstakedAmountMock = jest.spyOn(
      serviceRequestCommand,
      'retrieveUnstakedAmount',
    );

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
    expect(queryServiceRequestMock).not.toHaveBeenCalled();
    expect(retrieveUnstakedAmountMock).not.toHaveBeenCalled();
  });

  it('should update index data in elasticsearch', async () => {
    const queryServiceRequestMock = jest.spyOn(serviceRequestQuery, 'queryServiceRequestById').mockImplementation();
    const retrieveUnstakedAmountMock = jest.spyOn(serviceRequestCommand, 'retrieveUnstakedAmount').mockImplementation();

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
                  unstaked_at: new Date().getTime().toString(),
                },
              },
            },
          ],
        },
      },
    };

    const SUBSTRATE_RESULT: ServiceRequest = new ServiceRequest({
      hash: 'string',
      requester_address: 'string',
      lab_address: 'string',
      country: 'string',
      region: 'string',
      city: 'string',
      service_category: 'string',
      staking_amount: 0,
      status: 'Unstaked',
      created_at: new Date(),
      updated_at: new Date(),
      unstaked_at: new Date(),
    });

    when(queryServiceRequestMock)
      .calledWith(substrateServiceMock.api, REQUEST_ID)
      .mockReturnValue(SUBSTRATE_RESULT);

    when(elasticsearchServiceMock.search)
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);
    
    await unstakedService.handleWaitingUnstaked();
    expect(queryServiceRequestMock).toHaveBeenCalled();
    expect(elasticsearchServiceMock.update).toHaveBeenCalled();
    expect(retrieveUnstakedAmountMock).not.toHaveBeenCalled();
    expect(MockLogger.error).toHaveBeenCalledTimes(1);
    queryServiceRequestMock.mockClear();
    retrieveUnstakedAmountMock.mockClear();
  });

  it('should unstakedServiceRequest', async () => {
    const queryServiceRequestMock = jest.spyOn(
      serviceRequestQuery,
      'queryServiceRequestById',
    );
    const retrieveUnstakedAmountMock = jest.spyOn(
      serviceRequestCommand,
      'retrieveUnstakedAmount',
    );

    const CALLED_WITH = createSearchObject();
    const REQUEST_ID = 'string';
    const SIX_DAYS = 7 * 24 * 60 * 60 * 1000;
    const ES_RESULT = {
      body: {
        hits: {
          hits: [
            {
              _source: {
                request: {
                  hash: REQUEST_ID,
                  unstaked_at: (new Date().getTime() - SIX_DAYS).toString(),
                },
              },
            },
          ],
        },
      },
    };

    const SUBSTRATE_RESULT: ServiceRequest = new ServiceRequest({
      hash: 'string',
      requester_address: 'string',
      lab_address: 'string',
      country: 'string',
      region: 'string',
      city: 'string',
      service_category: 'string',
      staking_amount: 0,
      status: 'WaitingForUnstaked',
      created_at: new Date(),
      updated_at: new Date(),
      unstaked_at: new Date(),
    });

    when(queryServiceRequestMock)
      .calledWith(substrateServiceMock.api, REQUEST_ID)
      .mockReturnValue(SUBSTRATE_RESULT);

    when(elasticsearchServiceMock.search.mockReturnValue(ES_RESULT))
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);
    
    await unstakedService.handleWaitingUnstaked();
    expect(queryServiceRequestMock).toHaveBeenCalled();
    expect(retrieveUnstakedAmountMock).toHaveBeenCalled();
    
    queryServiceRequestMock.mockClear();
    retrieveUnstakedAmountMock.mockClear();
  });
});
