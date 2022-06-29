import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import {
  elasticsearchServiceMockFactory,
  substrateServiceMockFactory,
  MockType,
  MockLogger,
  schedulerRegistryMockFactory,
} from '../../mock';
import { SubstrateService } from '../../../../src/common';
import { Lab } from '@debionetwork/polkadot-provider';

import { SchedulerRegistry } from '@nestjs/schedule';
import { LabUnstakedService } from '../../../../src/schedulers/lab-unstake/lab-unstake.service';
import * as labQuery from '@debionetwork/polkadot-provider/lib/query/labs';
import * as labCommand from '@debionetwork/polkadot-provider/lib/command/labs';
import { when } from 'jest-when';
import { StakeStatus } from '@debionetwork/polkadot-provider/lib/primitives/stake-status';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';

jest.useFakeTimers();
jest.spyOn(global, 'setInterval');

describe('LabUnstakedService', () => {
  let labUnstakedService: LabUnstakedService;
  let elasticsearchServiceMock: MockType<ElasticsearchService>;
  let substrateServiceMock: MockType<SubstrateService>;
  let schedulerRegistryMock: MockType<SchedulerRegistry>;
  const strToMilisecondSpy = jest.spyOn(
    LabUnstakedService.prototype,
    'strToMilisecond',
  );

  const INTERVAL = '00:00:00:30';
  const TIMER = '6:00:00:00';

  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['UNSTAKE_INTERVAL', INTERVAL],
      ['UNSTAKE_TIMER', TIMER],
    ]);
    loadSecrets() {
      return null;
    }

    getSecret(key) {
      return this._secretsList.get(key);
    }
  }

  const createSearchObject = () => {
    return {
      index: 'labs',
      allow_no_indices: true,
      body: {
        query: {
          match: {
            stake_status: {
              query: 'WaitingForUnstaked',
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
        LabUnstakedService,
        {
          provide: GCloudSecretManagerService,
          useClass: GoogleSecretManagerServiceMock,
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

    labUnstakedService = module.get(LabUnstakedService);
    elasticsearchServiceMock = module.get(ElasticsearchService);
    substrateServiceMock = module.get(SubstrateService);
    schedulerRegistryMock = module.get(SchedulerRegistry);
    await module.init();
  });

  it('should be defined', () => {
    const EXPECTED_PARAM = 30 * 1000;

    expect(labUnstakedService).toBeDefined();

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

    expect(labUnstakedService.strToMilisecond(PARAM)).toBe(EXPECTED_RETURN);
  });

  it('should not do anything', () => {
    const queryLabMock = jest.spyOn(labQuery, 'queryLabById');
    const retrieveLabUnstakeAmountMock = jest.spyOn(
      labCommand,
      'retrieveLabUnstakeAmount',
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

    labUnstakedService.handleWaitingLabUnstaked();
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
    expect(queryLabMock).not.toHaveBeenCalled();
    expect(retrieveLabUnstakeAmountMock).not.toHaveBeenCalled();
  });

  it('should update index data in elasticsearch', async () => {
    const queryLabMock = jest
      .spyOn(labQuery, 'queryLabById')
      .mockImplementation();
    const retrieveLabUnstakeAmountMock = jest
      .spyOn(labCommand, 'retrieveLabUnstakeAmount')
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

    const SUBSTRATE_RESULT: Lab = new Lab({
      accountId: 'string',
      services: 'string',
      certifications: [],
      verificationStatus: [],
      stakeAmount: 1,
      stakeStatus: StakeStatus.Unstaked,
      unstakeAt: new Date(),
      retrieveUnstakeAt: new Date(),
      info: {
        boxPublicKey: 'string',
        name: 'string',
        email: 'string',
        phoneNumber: 'string',
        website: 'string',
        country: 'string',
        region: 'string',
        city: 'string',
        address: 'string',
        latitude: 'string',
        longitude: 'string',
        profileImage: 'string',
      },
    });

    when(queryLabMock)
      .calledWith(substrateServiceMock.api, REQUEST_ID)
      .mockReturnValue(SUBSTRATE_RESULT);

    when(elasticsearchServiceMock.search)
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);

    await labUnstakedService.handleWaitingLabUnstaked();
    expect(queryLabMock).toHaveBeenCalled();
    expect(elasticsearchServiceMock.update).toHaveBeenCalled();
    expect(retrieveLabUnstakeAmountMock).not.toHaveBeenCalled();
    expect(MockLogger.error).toHaveBeenCalledTimes(1);
    queryLabMock.mockClear();
    retrieveLabUnstakeAmountMock.mockClear();
  });

  it('should unstakedServiceRequest', async () => {
    const queryLabMock = jest.spyOn(labQuery, 'queryLabById');
    const retrieveLabUnstakeAmountMock = jest.spyOn(
      labCommand,
      'retrieveLabUnstakeAmount',
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
                account_id: REQUEST_ID,
                unstaked_at: (new Date().getTime() - TIMER).toString(),
              },
            },
          ],
        },
      },
    };

    const SUBSTRATE_RESULT: Lab = new Lab({
      accountId: 'string',
      services: 'string',
      certifications: [],
      verificationStatus: [],
      stakeAmount: 1,
      stakeStatus: StakeStatus.Staked,
      unstakeAt: new Date(),
      retrieveUnstakeAt: new Date(),
      info: {
        boxPublicKey: 'string',
        name: 'string',
        email: 'string',
        phoneNumber: 'string',
        website: 'string',
        country: 'string',
        region: 'string',
        city: 'string',
        address: 'string',
        latitude: 'string',
        longitude: 'string',
        profileImage: 'string',
      },
    });

    when(queryLabMock)
      .calledWith(substrateServiceMock.api, REQUEST_ID)
      .mockReturnValue(SUBSTRATE_RESULT);

    when(elasticsearchServiceMock.search.mockReturnValue(ES_RESULT))
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);

    await labUnstakedService.handleWaitingLabUnstaked();
    expect(queryLabMock).toHaveBeenCalled();
    expect(retrieveLabUnstakeAmountMock).toHaveBeenCalled();

    queryLabMock.mockClear();
    retrieveLabUnstakeAmountMock.mockClear();
  });

  it('should not called unstakedServiceRequest', async () => {
    const queryLabMock = jest.spyOn(labQuery, 'queryLabById');
    const retrieveLabUnstakeAmountMock = jest.spyOn(
      labCommand,
      'retrieveLabUnstakeAmount',
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
                account_id: REQUEST_ID,
                unstaked_at: (new Date().getTime() - TIMER).toString(),
              },
            },
          ],
        },
      },
    };

    const SUBSTRATE_RESULT: Lab = new Lab({
      accountId: 'string',
      services: 'string',
      certifications: [],
      verificationStatus: [],
      stakeAmount: 1,
      stakeStatus: StakeStatus.Staked,
      unstakeAt: new Date(),
      retrieveUnstakeAt: new Date(),
      info: {
        boxPublicKey: 'string',
        name: 'string',
        email: 'string',
        phoneNumber: 'string',
        website: 'string',
        country: 'string',
        region: 'string',
        city: 'string',
        address: 'string',
        latitude: 'string',
        longitude: 'string',
        profileImage: 'string',
      },
    });

    when(queryLabMock)
      .calledWith(substrateServiceMock.api, REQUEST_ID)
      .mockReturnValue(SUBSTRATE_RESULT);

    when(elasticsearchServiceMock.search.mockReturnValue(ES_RESULT))
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);

    await labUnstakedService.handleWaitingLabUnstaked();
    expect(queryLabMock).toHaveBeenCalled();
    expect(retrieveLabUnstakeAmountMock).not.toHaveBeenCalled();

    queryLabMock.mockClear();
    retrieveLabUnstakeAmountMock.mockClear();
  });
});
