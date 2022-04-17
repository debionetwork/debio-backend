import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import {
  elasticsearchServiceMockFactory,
  substrateServiceMockFactory,
  MockType,
  MockLogger,
  schedulerRegistryMockFactory,
} from '../../mock';
import { UnstakedService } from '../../../../src/schedulers/unstaked/unstaked.service';
import { ProcessEnvProxy, SubstrateService } from '../../../../src/common';
import { ServiceRequest } from '@debionetwork/polkadot-provider';

import * as serviceRequestQuery from '@debionetwork/polkadot-provider/lib/query/service-request';
import * as serviceRequestCommand from '@debionetwork/polkadot-provider/lib/command/service-request';
import { when } from 'jest-when';
import { SchedulerRegistry } from '@nestjs/schedule';

jest.useFakeTimers();
jest.spyOn(global, 'setInterval');

describe('UnstakedService', () => {
  let unstakedService: UnstakedService;
  let elasticsearchServiceMock: MockType<ElasticsearchService>;
  let substrateServiceMock: MockType<SubstrateService>;
  let schedulerRegistryMock: MockType<SchedulerRegistry>;
  const strToMilisecondSpy = jest.spyOn(
    UnstakedService.prototype,
    'strToMilisecond',
  );

  const INTERVAL = '00:00:00:30';
  const TIMER = '6:00:00:00';

  class ProcessEnvProxyMock {
    env = {
      UNSTAKE_INTERVAL: INTERVAL,
      UNSTAKE_TIMER: TIMER,
    };
  }

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
          provide: ProcessEnvProxy,
          useClass: ProcessEnvProxyMock,
        },
        {
          provide: ElasticsearchService,
          useFactory: elasticsearchServiceMockFactory,
        },
        {
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory,
        },
        {
          provide: SchedulerRegistry,
          useFactory: schedulerRegistryMockFactory,
        },
      ],
    }).compile();
    module.useLogger(MockLogger);

    unstakedService = module.get(UnstakedService);
    elasticsearchServiceMock = module.get(ElasticsearchService);
    substrateServiceMock = module.get(SubstrateService);
    schedulerRegistryMock = module.get(SchedulerRegistry);
    await module.init();
  });

  it('should be defined', () => {
    const EXPECTED_PARAM = 30 * 1000;

    expect(unstakedService).toBeDefined();

    expect(setInterval).toHaveBeenCalled();
    expect(setInterval).toHaveBeenCalledWith(
      expect.any(Function),
      EXPECTED_PARAM,
    );
    expect(schedulerRegistryMock.addInterval).toHaveBeenCalled();
    expect(strToMilisecondSpy).toHaveBeenCalled();
    expect(strToMilisecondSpy).toHaveBeenCalledTimes(2);
    expect(strToMilisecondSpy).toHaveBeenCalledWith(TIMER);
    expect(strToMilisecondSpy).toHaveBeenCalledWith(INTERVAL);
  });

  it('should return 6 days in milisecond', () => {
    const PARAM = '06:00:00:00';
    const EXPECTED_RETURN = 6 * 24 * 60 * 60 * 1000;

    expect(unstakedService.strToMilisecond(PARAM)).toBe(EXPECTED_RETURN);
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
    const queryServiceRequestMock = jest
      .spyOn(serviceRequestQuery, 'queryServiceRequestById')
      .mockImplementation();
    const retrieveUnstakedAmountMock = jest
      .spyOn(serviceRequestCommand, 'retrieveUnstakedAmount')
      .mockImplementation();

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
    const TIMER = 7 * 24 * 60 * 60 * 1000;
    const ES_RESULT = {
      body: {
        hits: {
          hits: [
            {
              _source: {
                request: {
                  hash: REQUEST_ID,
                  unstaked_at: (new Date().getTime() - TIMER).toString(),
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

  it('should not called unstakedServiceRequest', async () => {
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
    const TIMER = 5 * 24 * 60 * 60 * 1000;
    const ES_RESULT = {
      body: {
        hits: {
          hits: [
            {
              _source: {
                request: {
                  hash: REQUEST_ID,
                  unstaked_at: (new Date().getTime() - TIMER).toString(),
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
    expect(retrieveUnstakedAmountMock).not.toHaveBeenCalled();

    queryServiceRequestMock.mockClear();
    retrieveUnstakedAmountMock.mockClear();
  });
});
