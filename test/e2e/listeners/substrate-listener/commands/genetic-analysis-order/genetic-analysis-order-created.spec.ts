import { ApiPromise } from '@polkadot/api';
import 'regenerator-runtime/runtime';
import { TestingModule } from '@nestjs/testing/testing-module';
import { Test } from '@nestjs/testing/test';
import { INestApplication } from '@nestjs/common/interfaces/nest-application.interface';
import { initializeApi } from '../../../../polkadot-init';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { LabRating } from '../../../../../../src/endpoints/rating/models/rating.entity';
import { TransactionRequest } from '../../../../../../src/common/modules/transaction-logging/models/transaction-request.entity';
import { LocationEntities } from '../../../../../../src/endpoints/location/models';
import { dummyCredentials } from '../../../../config';
import { EscrowService } from '../../../../../../src/common/modules/escrow/escrow.service';
import { escrowServiceMockFactory } from '../../../../../unit/mock';
import {
  DateTimeModule,
  DebioConversionModule,
  MailModule,
  NotificationModule,
  ProcessEnvModule,
  SubstrateModule,
  TransactionLoggingModule,
} from '../../../../../../src/common';
import { LocationModule } from '../../../../../../src/endpoints/location/location.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SubstrateListenerHandler } from '../../../../../../src/listeners/substrate-listener/substrate-listener.handler';
import {
  GeneticAnalysisOrder,
  GeneticAnalyst,
  GeneticAnalystService,
  GeneticData,
} from '@debionetwork/polkadot-provider/lib/models/genetic-analysts';
import { GeneticAnalysisOrderCommandHandlers } from '../../../../../../src/listeners/substrate-listener/commands/genetic-analysis-order';
import {
  addGeneticData,
  createGeneticAnalysisOrder,
  createGeneticAnalystService,
<<<<<<< HEAD
  deleteGeneticAnalystService,
=======
>>>>>>> 247ef966387572453d970f32b646c70e70772d45
  queryGeneticAnalysisOrderByCustomerId,
  queryGeneticAnalystByAccountId,
  queryGeneticAnalystServicesByHashId,
  queryGeneticDataByOwnerId,
<<<<<<< HEAD
  queryGeneticAnalystServicesCount,
  deregisterGeneticAnalyst,
=======
>>>>>>> 247ef966387572453d970f32b646c70e70772d45
  registerGeneticAnalyst,
  stakeGeneticAnalyst,
  updateGeneticAnalystVerificationStatus,
} from '@debionetwork/polkadot-provider';
import { geneticAnalystsDataMock } from '../../../../../mocks/models/genetic-analysts/genetic-analysts.mock';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';
import { geneticAnalystServiceDataMock } from '../../../../../mocks/models/genetic-analysts/genetic-analyst-service.mock';
import { Notification } from '../../../../../../src/common/modules/notification/models/notification.entity';
import { createConnection } from 'typeorm';

describe('Genetic Analysis Order Created Integration Test', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
  let ga: GeneticAnalyst;
  let gaService: GeneticAnalystService;
  let geneticData: GeneticData;
  let geneticAnalysisOrder: GeneticAnalysisOrder;

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
        TypeOrmModule.forRoot({
          type: 'postgres',
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [LabRating, TransactionRequest],
          autoLoadEntities: true,
        }),
        TypeOrmModule.forRoot({
          name: 'dbLocation',
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [...LocationEntities],
          autoLoadEntities: true,
        }),
        ProcessEnvModule,
        LocationModule,
        TransactionLoggingModule,
        SubstrateModule,
        DebioConversionModule,
        MailModule,
        CqrsModule,
        DateTimeModule,
        NotificationModule,
        ElasticsearchModule.registerAsync({
          useFactory: async () => ({
            node: process.env.ELASTICSEARCH_NODE,
            auth: {
              username: process.env.ELASTICSEARCH_USERNAME,
              password: process.env.ELASTICSEARCH_PASSWORD,
            },
          }),
        }),
      ],
      providers: [
        {
          provide: EscrowService,
          useFactory: escrowServiceMockFactory,
        },
        SubstrateListenerHandler,
        ...GeneticAnalysisOrderCommandHandlers,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    const { api: _api, pair: _pair } = await initializeApi();
    api = _api;
    pair = _pair;
  }, 360000);

  afterAll(() => {
    api.disconnect();
  });

  it('genetic analysis order created event', async () => {
    const gaPromise: Promise<GeneticAnalyst> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        registerGeneticAnalyst(api, pair, geneticAnalystsDataMock.info, () => {
          stakeGeneticAnalyst(api, pair, () => {
            updateGeneticAnalystVerificationStatus(
              api,
              pair,
              pair.address,
              VerificationStatus.Verified,
              () => {
                queryGeneticAnalystByAccountId(api, pair.address).then(
                  (res) => {
                    resolve(res);
                  },
                );
              },
            );
          });
        });
      },
    );

    ga = await gaPromise;
    expect(ga.normalize().info).toEqual(geneticAnalystsDataMock.info);

    const gaServicePromise: Promise<GeneticAnalystService> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        createGeneticAnalystService(
          api,
          pair,
          geneticAnalystServiceDataMock.info,
          () => {
            queryGeneticAnalystByAccountId(api, pair.address).then((ga) => {
              queryGeneticAnalystServicesByHashId(api, ga.services[0]).then(
                (res) => {
                  resolve(res);
                },
              );
            });
          },
        );
      },
    );

    gaService = await gaServicePromise;
    expect(gaService.info).toEqual(
      expect.objectContaining({
        name: geneticAnalystServiceDataMock.info.name,
        testResultSample: geneticAnalystServiceDataMock.info.testResultSample,
        description: geneticAnalystServiceDataMock.info.description,
      }),
    );

    const geneticDataPromise: Promise<GeneticData> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        addGeneticData(api, pair, 'string', 'string', 'string', () => {
          queryGeneticDataByOwnerId(api, pair.address).then((res) => {
            resolve(res.at(-1));
          });
        });
      },
    );

    geneticData = await geneticDataPromise;

    const geneticAnalysisOrderPromise: Promise<GeneticAnalysisOrder> =
      // eslint-disable-next-line
      new Promise((resolve, reject) => {
        createGeneticAnalysisOrder(
          api,
          pair,
          geneticData.id,
          gaService.id,
          0,
          geneticData.reportLink,
          '0x8d2f0702072c07d31251be881104acde7953ecc1c8b33c31fce59ec6b0799ecc',
          () => {
            queryGeneticAnalysisOrderByCustomerId(api, pair.address).then(
              (res) => {
                resolve(res.at(-1));
              },
            );
          },
        );
      });

    geneticAnalysisOrder = await geneticAnalysisOrderPromise;
    expect(geneticAnalysisOrder.serviceId).toEqual(gaService.id);
    expect(geneticAnalysisOrder.customerId).toEqual(pair.address);
    expect(geneticAnalysisOrder.sellerId).toEqual(pair.address);

    const dbConnection = await createConnection({
      ...dummyCredentials,
      database: 'db_postgres',
      entities: [Notification],
      synchronize: true,
    });

    const notifications = await dbConnection
      .getRepository(Notification)
      .createQueryBuilder('notification')
      .where('notification.to = :to', {
        to: geneticAnalysisOrder.sellerId,
      })
      .where('notification.entity = :entity', { entity: 'Order Created' })
      .getMany();

    expect(notifications.length).toEqual(1);
    expect(notifications[0].to).toEqual(geneticAnalysisOrder.sellerId);
    expect(notifications[0].entity).toEqual('Order Created');
    expect(
      notifications[0].description.includes(
        `You've successfully submitted your requested test for ${geneticAnalysisOrder.id}.`,
      ),
    ).toBeTruthy();

    const deletePromise: Promise<number> = new Promise((resolve, reject) => {
      deleteGeneticAnalystService(api, pair, gaService.id, () => {
        queryGeneticAnalystServicesCount(api).then((res) => {
          deregisterGeneticAnalyst(api, pair, () => {
            resolve(res);
          });
        });
      });
    });

    expect(await deletePromise).toEqual(0);
  }, 360000);
});
