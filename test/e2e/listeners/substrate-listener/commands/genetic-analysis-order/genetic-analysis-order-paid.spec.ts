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
  GeneticAnalysisOrderStatus,
  GeneticAnalyst,
  GeneticAnalystService,
  GeneticData,
} from '@debionetwork/polkadot-provider/lib/models/genetic-analysts';
import { GeneticAnalysisOrderCommandHandlers } from '../../../../../../src/listeners/substrate-listener/commands/genetic-analysis-order';
import {
  deleteGeneticAnalystService,
  deregisterGeneticAnalyst,
  queryGeneticAnalysisOrderByCustomerId,
  queryGeneticAnalysisOrderById,
  queryGeneticAnalystByAccountId,
  queryGeneticAnalystServicesByHashId,
  queryGeneticAnalystServicesCount,
  queryGeneticDataByOwnerId,
  setGeneticAnalysisOrderPaid,
} from '@debionetwork/polkadot-provider';
import { geneticAnalystsDataMock } from '../../../../../mocks/models/genetic-analysts/genetic-analysts.mock';
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

  afterAll(async () => {
    await api.disconnect();
    await app.close();
  });

  it('genetic analysis order event', async () => {
    const gaPromise: Promise<GeneticAnalyst> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
          resolve(res);
        });
      },
    );

    ga = await gaPromise;
    expect(ga.normalize().info).toEqual(geneticAnalystsDataMock.info);

    const gaServicePromise: Promise<GeneticAnalystService> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        queryGeneticAnalystServicesByHashId(api, ga.services[0]).then((res) => {
          resolve(res);
        });
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
        queryGeneticDataByOwnerId(api, pair.address).then((res) => {
          resolve(res.at(-1));
        });
      },
    );

    geneticData = await geneticDataPromise;
    expect(geneticData).toEqual(
      expect.objectContaining({
        title: 'string',
        description: 'string',
        reportLink: 'string',
      }),
    );

    const geneticAnalysisOrderPromise: Promise<GeneticAnalysisOrder> =
      // eslint-disable-next-line
      new Promise((resolve, reject) => {
        queryGeneticAnalysisOrderByCustomerId(api, pair.address).then((res) => {
          resolve(res.at(-1));
        });
      });

    geneticAnalysisOrder = await geneticAnalysisOrderPromise;
    expect(geneticAnalysisOrder.serviceId).toEqual(gaService.id);
    expect(geneticAnalysisOrder.customerId).toEqual(pair.address);
    expect(geneticAnalysisOrder.sellerId).toEqual(pair.address);

    const geneticAnalysisOrderPaidPromise: Promise<GeneticAnalysisOrder> =
      // eslint-disable-next-line
      new Promise((resolve, reject) => {
        setGeneticAnalysisOrderPaid(api, pair, geneticAnalysisOrder.id, () => {
          queryGeneticAnalysisOrderById(api, geneticAnalysisOrder.id).then(
            (res) => {
              resolve(res);
            },
          );
        });
      });

    geneticAnalysisOrder = await geneticAnalysisOrderPaidPromise;
    expect(geneticAnalysisOrder.serviceId).toEqual(gaService.id);
    expect(geneticAnalysisOrder.customerId).toEqual(pair.address);
    expect(geneticAnalysisOrder.sellerId).toEqual(pair.address);
    expect(geneticAnalysisOrder.status).toEqual(
      GeneticAnalysisOrderStatus.Paid,
    );

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
      .where('notification.entity = :entity', { entity: 'New Order' })
      .getMany();

    expect(notifications.length).toEqual(1);
    expect(notifications[0].to).toEqual(geneticAnalysisOrder.sellerId);
    expect(notifications[0].entity).toEqual('New Order');
    expect(
      notifications[0].description.includes(
        `A new order ${geneticAnalysisOrder.id} is awaiting process.`,
      ),
    ).toBeTruthy();

    // eslint-disable-next-line
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
  }, 160000);
});
