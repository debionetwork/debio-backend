import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import {
  elasticsearchServiceMockFactory,
  substrateServiceMockFactory,
  MockType,
  MockLogger,
  schedulerRegistryMockFactory,
} from '../../mock';
import { ProcessEnvProxy, SubstrateService } from '../../../../src/common';
import { GeneticAnalyst } from '@debionetwork/polkadot-provider';

import * as geneticAnalystQuery from '@debionetwork/polkadot-provider/lib/query/genetic-analysts';
import * as geneticAnalystCommand from '@debionetwork/polkadot-provider/lib/command/genetic-analyst';
import { when } from 'jest-when';
import { SchedulerRegistry } from '@nestjs/schedule';
import { GeneticAnalystUnstakedService } from '../../../../src/schedulers/genetic-analyst-unstaked/unstaked.service';

jest.useFakeTimers();
jest.spyOn(global, 'setInterval');

describe('UnstakedService', () => {
  let geneticAnalystUnstakedService: GeneticAnalystUnstakedService;
  let elasticsearchServiceMock: MockType<ElasticsearchService>;
  let substrateServiceMock: MockType<SubstrateService>;
  let schedulerRegistryMock: MockType<SchedulerRegistry>;
  const strToMilisecondSpy = jest.spyOn(
    GeneticAnalystUnstakedService.prototype,
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
      index: 'genetic-analysts',
      allow_no_indices: true,
      body: {
        query: {
          match: {
            stake_status: {
              query: 'WaitingForUnStaked',
            },
          },
        },
        sort: [
          {
            'unstake_at.keyword': {
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
        GeneticAnalystUnstakedService,
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

    geneticAnalystUnstakedService = module.get(GeneticAnalystUnstakedService);
    elasticsearchServiceMock = module.get(ElasticsearchService);
    substrateServiceMock = module.get(SubstrateService);
    schedulerRegistryMock = module.get(SchedulerRegistry);
    await module.init();
  });

  it('should be defined', () => {
    const EXPECTED_PARAM = 30 * 1000;

    expect(geneticAnalystUnstakedService).toBeDefined();

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

    expect(geneticAnalystUnstakedService.strToMilisecond(PARAM)).toBe(
      EXPECTED_RETURN,
    );
  });

  it('should not do anything', () => {
    const queryGeneticAnalystByAccountIdMock = jest.spyOn(
      geneticAnalystQuery,
      'queryGeneticAnalystByAccountId',
    );
    const retrieveUnstakeAmountMock = jest.spyOn(
      geneticAnalystCommand,
      'retrieveUnstakeAmount',
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

    geneticAnalystUnstakedService.handleWaitingUnstakedGA();
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
    expect(queryGeneticAnalystByAccountIdMock).not.toHaveBeenCalled();
    expect(retrieveUnstakeAmountMock).not.toHaveBeenCalled();
  });

  it('should update index data in elasticsearch', async () => {
    const queryGeneticAnalystByAccountIdMock = jest.spyOn(
      geneticAnalystQuery,
      'queryGeneticAnalystByAccountId',
    );
    const retrieveUnstakedAmountMock = jest
      .spyOn(geneticAnalystCommand, 'retrieveUnstakeAmount')
      .mockImplementation();

    const CALLED_WITH = createSearchObject();
    const REQUEST_ID = 'string';
    const ES_RESULT = {
      body: {
        hits: {
          hits: [
            {
              _source: {
                account_id: REQUEST_ID,
                unstaked_at: new Date().getTime().toString(),
              },
            },
          ],
        },
      },
    };

    const SUBSTRATE_RESULT: GeneticAnalyst = new GeneticAnalyst({
      accountId: 'string',
      services: [],
      qualifications: [],
      info: {
        boxPublicKey: 'string',
        firstName: 'string',
        lastName: 'string',
        gender: 'string',
        dateOfBirth: 1,
        email: 'string',
        phoneNumber: 'string',
        specialization: 'string',
        profileLink: 'string',
        profileImage: 'string',
      },
      stakeAmount: 1,
      stakeStatus: 'Unstaked',
      verificationStatus: 'Verified',
      availabilityStatus: 'Available',
      unstakeAt: new Date(),
      retrieveUnstakeAt: new Date(),
    });

    when(queryGeneticAnalystByAccountIdMock)
      .calledWith(substrateServiceMock.api, REQUEST_ID)
      .mockReturnValue(SUBSTRATE_RESULT);

    when(elasticsearchServiceMock.search)
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);

    await geneticAnalystUnstakedService.handleWaitingUnstakedGA();
    expect(queryGeneticAnalystByAccountIdMock).toHaveBeenCalled();
    expect(elasticsearchServiceMock.update).toHaveBeenCalled();
    expect(retrieveUnstakedAmountMock).not.toHaveBeenCalled();
    expect(MockLogger.error).toHaveBeenCalledTimes(1);
    queryGeneticAnalystByAccountIdMock.mockClear();
    retrieveUnstakedAmountMock.mockClear();
  });

  it('should geneticAnalystUnstakedServiceRequest', async () => {
    const queryGeneticAnalystByAccountIdMock = jest.spyOn(
      geneticAnalystQuery,
      'queryGeneticAnalystByAccountId',
    );
    const retrieveUnstakedAmountMock = jest.spyOn(
      geneticAnalystCommand,
      'retrieveUnstakeAmount',
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

    const SUBSTRATE_RESULT: GeneticAnalyst = new GeneticAnalyst({
      accountId: 'string',
      services: [],
      qualifications: [],
      info: {
        boxPublicKey: 'string',
        firstName: 'string',
        lastName: 'string',
        gender: 'string',
        dateOfBirth: 1,
        email: 'string',
        phoneNumber: 'string',
        specialization: 'string',
        profileLink: 'string',
        profileImage: 'string',
      },
      stakeAmount: 1,
      stakeStatus: 'WaitingForUnstaked',
      verificationStatus: 'Verified',
      availabilityStatus: 'Available',
      unstakeAt: new Date(),
      retrieveUnstakeAt: new Date(),
    });

    when(queryGeneticAnalystByAccountIdMock)
      .calledWith(substrateServiceMock.api, REQUEST_ID)
      .mockReturnValue(SUBSTRATE_RESULT);

    when(elasticsearchServiceMock.search.mockReturnValue(ES_RESULT))
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);

    await geneticAnalystUnstakedService.handleWaitingUnstakedGA();
    expect(queryGeneticAnalystByAccountIdMock).toHaveBeenCalled();
    expect(retrieveUnstakedAmountMock).toHaveBeenCalled();

    queryGeneticAnalystByAccountIdMock.mockClear();
    retrieveUnstakedAmountMock.mockClear();
  });

  it('should not called geneticAnalystUnstakedServiceRequest', async () => {
    const queryGeneticAnalystByAccountIdMock = jest.spyOn(
      geneticAnalystQuery,
      'queryGeneticAnalystByAccountId',
    );
    const retrieveUnstakedAmountMock = jest.spyOn(
      geneticAnalystCommand,
      'retrieveUnstakeAmount',
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

    const SUBSTRATE_RESULT: GeneticAnalyst = new GeneticAnalyst({
      accountId: 'string',
      services: [],
      qualifications: [],
      info: {
        boxPublicKey: 'string',
        firstName: 'string',
        lastName: 'string',
        gender: 'string',
        dateOfBirth: 1,
        email: 'string',
        phoneNumber: 'string',
        specialization: 'string',
        profileLink: 'string',
        profileImage: 'string',
      },
      stakeAmount: 1,
      stakeStatus: 'WaitingForUnstaked',
      verificationStatus: 'Verified',
      availabilityStatus: 'Available',
      unstakeAt: new Date(),
      retrieveUnstakeAt: new Date(),
    });

    when(queryGeneticAnalystByAccountIdMock)
      .calledWith(substrateServiceMock.api, REQUEST_ID)
      .mockReturnValue(SUBSTRATE_RESULT);

    when(elasticsearchServiceMock.search.mockReturnValue(ES_RESULT))
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);

    await geneticAnalystUnstakedService.handleWaitingUnstakedGA();
    expect(queryGeneticAnalystByAccountIdMock).toHaveBeenCalled();
    expect(retrieveUnstakedAmountMock).not.toHaveBeenCalled();

    queryGeneticAnalystByAccountIdMock.mockClear();
    retrieveUnstakedAmountMock.mockClear();
  });
});
