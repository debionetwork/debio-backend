import 'regenerator-runtime/runtime';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SubstrateModule, SubstrateService } from '../../../src/common';
import {
  ElasticsearchModule,
  ElasticsearchService,
} from '@nestjs/elasticsearch';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { LabUnstakedService } from '../../../src/schedulers/lab-unstake/lab-unstake.service';
import * as labQuery from '@debionetwork/polkadot-provider/lib/query/labs';
import { Lab } from '@debionetwork/polkadot-provider';
import { StakeStatus } from '@debionetwork/polkadot-provider/lib/primitives/stake-status';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';

describe('Lab Unstaked Scheduler (e2e)', () => {
  let schedulerRegistry: SchedulerRegistry;
  let labUnstakedService: LabUnstakedService;
  let substrateService: SubstrateService;
  let gCloudSecretManagerService: GCloudSecretManagerService;
  let elasticsearchService: ElasticsearchService;

  let app: INestApplication;

  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['ELASTICSEARCH_NODE', process.env.ELASTICSEARCH_NODE],
      ['ELASTICSEARCH_USERNAME', process.env.ELASTICSEARCH_USERNAME],
      ['ELASTICSEARCH_PASSWORD', process.env.ELASTICSEARCH_PASSWORD],
      ['ADMIN_SUBSTRATE_MNEMONIC', process.env.ADMIN_SUBSTRATE_MNEMONIC],
      ['UNSTAKE_TIMER', process.env.UNSTAKE_TIMER],
      ['UNSTAKE_INTERVAL', process.env.UNSTAKE_INTERVAL],
    ]);
    loadSecrets() {
      return null;
    }

    getSecret(key) {
      return this._secretsList.get(key);
    }
  }

  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        GCloudSecretManagerModule,
        ElasticsearchModule.registerAsync({
          imports: [GCloudSecretManagerModule],
          inject: [GCloudSecretManagerService],
          useFactory: async (
            gCloudSecretManagerService: GCloudSecretManagerService,
          ) => ({
            node: gCloudSecretManagerService
              .getSecret('ELASTICSEARCH_NODE')
              .toString(),
            auth: {
              username: gCloudSecretManagerService
                .getSecret('ELASTICSEARCH_USERNAME')
                .toString(),
              password: gCloudSecretManagerService
                .getSecret('ELASTICSEARCH_PASSWORD')
                .toString(),
            },
          }),
        }),
        SubstrateModule,
        ScheduleModule.forRoot(),
      ],
    })
      .overrideProvider(GCloudSecretManagerService)
      .useClass(GoogleSecretManagerServiceMock)
      .compile();

    schedulerRegistry = module.get(SchedulerRegistry);
    substrateService = module.get(SubstrateService);
    gCloudSecretManagerService = module.get(GCloudSecretManagerService);
    elasticsearchService = module.get(ElasticsearchService);

    labUnstakedService = new LabUnstakedService(
      gCloudSecretManagerService,
      elasticsearchService,
      substrateService,
      schedulerRegistry,
    );

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await substrateService.stopListen();
    substrateService.destroy();
  });

  it('lab-unstaked-interval must registered', async () => {
    labUnstakedService.onModuleInit();

    expect(
      schedulerRegistry.doesExists('interval', 'lab-unstaked-interval'),
    ).toBeTruthy();

    clearInterval(schedulerRegistry.getInterval('lab-unstaked-interval'));
  });

  it('handleWaitingLabUnstaked should not throw error', async () => {
    // Arrange
    const queryLabByIdSpy = jest.spyOn(labQuery, 'queryLabById');
    const RESULT: Lab = new Lab({
      accountId: '5DAsjPuMX8HD4LtA3fpxMydJuUXShS9JB1hYh4PS1QRBw5yv',
      services: [],
      certifications: [],
      verificationStatus: [],
      stakeAmount: 10000000,
      stakeStatus: StakeStatus.WaitingForUnstaked,
      unstakeAt: new Date(),
      retrieveUnstakeAt: new Date(),
      info: {
        boxPublicKey:
          '0x6684ce5f03f06808a5dd7abb5367a1b65a2fdc9c6b4de5aae3ebc2768eba0663',
        name: 'International Bioscience',
        email: 'info@ibdna.com.my',
        phoneNumber: '+608873187647186',
        website: 'inter-bio.com',
        country: 'MY',
        region: '01',
        city: 'Johor Bahru',
        address: 'Johor',
        latitude: null,
        longitude: null,
        profileImage: null,
      },
    });
    queryLabByIdSpy.mockImplementation(() => Promise.resolve(RESULT));

    // Act
    await labUnstakedService.handleWaitingLabUnstaked();

    // Assert
    expect(queryLabByIdSpy).toBeCalledTimes(1);
  });
});
