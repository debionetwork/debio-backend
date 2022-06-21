import 'regenerator-runtime/runtime';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import {
  GoogleSecretManagerModule,
  GoogleSecretManagerService,
  SubstrateModule,
  SubstrateService,
} from '../../../src/common';
import {
  ElasticsearchModule,
  ElasticsearchService,
} from '@nestjs/elasticsearch';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { LabUnstakedService } from '../../../src/schedulers/lab-unstake/lab-unstake.service';
import * as labQuery from '@debionetwork/polkadot-provider/lib/query/labs';
import { Lab } from '@debionetwork/polkadot-provider';
import { StakeStatus } from '@debionetwork/polkadot-provider/lib/primitives/stake-status';

describe('Lab Unstaked Scheduler (e2e)', () => {
  let schedulerRegistry: SchedulerRegistry;
  let labUnstakedService: LabUnstakedService;
  let substrateService: SubstrateService;
  let googleSecretManagerService: GoogleSecretManagerService;
  let elasticsearchService: ElasticsearchService;

  let app: INestApplication;

  class GoogleSecretManagerServiceMock {
    async accessSecret() {
      return null;
    }
    elasticsearchNode = process.env.ELASTICSEARCH_NODE;
    elasticsearchUsername = process.env.ELASTICSEARCH_USERNAME;
    elasticsearchPassword = process.env.ELASTICSEARCH_PASSWORD;
    adminSubstrateMnemonic = process.env.ADMIN_SUBSTRATE_MNEMONIC;
    unstakeTimer = process.env.UNSTAKE_TIMER;
    unstakeInterval = process.env.UNSTAKE_INTERVAL;
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
        GoogleSecretManagerModule,
        ElasticsearchModule.registerAsync({
          imports: [GoogleSecretManagerModule],
          inject: [GoogleSecretManagerService],
          useFactory: async (
            googleSecretManagerService: GoogleSecretManagerService,
          ) => ({
            node: googleSecretManagerService.elasticsearchNode,
            auth: {
              username: googleSecretManagerService.elasticsearchUsername,
              password: googleSecretManagerService.elasticsearchPassword,
            },
          }),
        }),
        SubstrateModule,
        ScheduleModule.forRoot(),
      ],
    })
      .overrideProvider(GoogleSecretManagerService)
      .useClass(GoogleSecretManagerServiceMock)
      .compile();

    schedulerRegistry = module.get(SchedulerRegistry);
    substrateService = module.get(SubstrateService);
    googleSecretManagerService = module.get(GoogleSecretManagerService);
    elasticsearchService = module.get(ElasticsearchService);

    console.log(
      googleSecretManagerService.elasticsearchNode,
      googleSecretManagerService.unstakeTimer,
    );
    labUnstakedService = new LabUnstakedService(
      googleSecretManagerService,
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
