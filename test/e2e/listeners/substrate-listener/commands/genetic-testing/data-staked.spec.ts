import { ApiPromise } from '@polkadot/api';
import 'regenerator-runtime/runtime';
import {
  queryLastOrderHashByCustomer,
  queryOrderDetailByOrderID,
} from '@debionetwork/polkadot-provider/lib/query/labs/orders';
import { createOrder } from '@debionetwork/polkadot-provider/lib/command/labs/orders';
import {
  processDnaSample,
  submitDataBountyDetails,
  submitTestResult,
} from '@debionetwork/polkadot-provider/lib/command/labs/genetic-testing';
import {
  createService,
  deleteService,
} from '@debionetwork/polkadot-provider/lib/command/labs/services';
import {
  queryLabById,
  queryStakedDataByAccountId,
  queryStakedDataByOrderId,
} from '@debionetwork/polkadot-provider/lib/query/labs';
import {
  queryServicesByMultipleIds,
  queryServicesCount,
} from '@debionetwork/polkadot-provider/lib/query/labs/services';
import { Lab } from '@debionetwork/polkadot-provider/lib/models/labs';
import {
  deregisterLab,
  registerLab,
} from '@debionetwork/polkadot-provider/lib/command/labs';
import { labDataMock } from '../../../../../mocks/models/labs/labs.mock';
import { Service } from '@debionetwork/polkadot-provider/lib/models/labs/services';
import { Order } from '@debionetwork/polkadot-provider/lib/models/labs/orders';
import { serviceDataMock } from '../../../../../mocks/models/labs/services.mock';
import { DnaSampleStatus } from '@debionetwork/polkadot-provider/lib/models/labs/genetic-testing/dna-sample-status';
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
import { createConnection } from 'typeorm';
import { GeneticTestingCommandHandlers } from '../../../../../../src/listeners/substrate-listener/commands/genetic-testing';
import { LabCommandHandlers } from 'src/listeners/substrate-listener/commands/labs';

describe('Data Staked Integration Tests', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
  let lab: Lab;
  let service: Service;
  let order: Order;

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
        ...GeneticTestingCommandHandlers,
        ...LabCommandHandlers,
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

  it('data staked event', async () => {
    // eslint-disable-next-line
    const labPromise: Promise<Lab> = new Promise((resolve, reject) => {
      registerLab(api, pair, labDataMock.info, () => {
        queryLabById(api, pair.address).then((res) => {
          resolve(res);
        });
      });
    });

    lab = await labPromise;
    expect(lab.info).toEqual(labDataMock.info);

    // eslint-disable-next-line
    const servicePromise: Promise<Service> = new Promise((resolve, reject) => {
      createService(
        api,
        pair,
        serviceDataMock.info,
        serviceDataMock.serviceFlow,
        () => {
          queryLabById(api, pair.address).then((lab) => {
            queryServicesByMultipleIds(api, lab.services).then((res) => {
              resolve(res[0]);
            });
          });
        },
      );
    });

    service = await servicePromise;

    // eslint-disable-next-line
    const orderPromise: Promise<Order> = new Promise((resolve, reject) => {
      createOrder(
        api,
        pair,
        service.id,
        0,
        lab.info.boxPublicKey,
        serviceDataMock.serviceFlow,
        () => {
          queryLastOrderHashByCustomer(api, pair.address).then((orderId) => {
            queryOrderDetailByOrderID(api, orderId).then((res) => {
              resolve(res);
            });
          });
        },
      );
    });

    order = await orderPromise;
    expect(order.customerId).toEqual(pair.address);
    expect(order.sellerId).toEqual(pair.address);
    expect(order.serviceId).toEqual(service.id);
    expect(order.customerBoxPublicKey).toEqual(lab.info.boxPublicKey);
    expect(order.orderFlow).toEqual(serviceDataMock.serviceFlow);

    await submitTestResult(api, pair, order.dnaSampleTrackingId, {
      comments: 'comment',
      resultLink: 'resultLink',
      reportLink: 'reportLink',
    });

    await processDnaSample(
      api,
      pair,
      order.dnaSampleTrackingId,
      DnaSampleStatus.ResultReady,
    );

    const submitDataBountyDetailsPromise: Promise<string[]> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        submitDataBountyDetails(api, pair, order.id, order.id, () => {
          // Order ID as data hash on param 1
          queryStakedDataByAccountId(api, pair.address).then((res) => {
            resolve(res);
          });
        });
      },
    );

    const stakedData = await submitDataBountyDetailsPromise;
    expect(stakedData).toEqual(order.id);

    const stakedDataByOrderId = await queryStakedDataByOrderId(api, order.id);
    expect(stakedDataByOrderId).toEqual(order.id);

    const dbConnection = await createConnection({
      ...dummyCredentials,
      database: 'db_postgres',
      entities: [TransactionRequest],
      synchronize: true,
    });

    const transactionLogs = await dbConnection
      .getRepository(TransactionRequest)
      .createQueryBuilder('transaction_logs')
      .where('transaction_logs.transaction_type = :transaction_type', {
        transaction_type: 8,
      })
      .where('transaction_logs.transaction_status = :transaction_status', {
        transaction_status: 34,
      })
      .getMany();

    expect(transactionLogs[0].ref_number).toEqual(order.id);
    expect(transactionLogs[0].transaction_type).toEqual(8);
    expect(transactionLogs[0].transaction_status).toEqual(34);

    // eslint-disable-next-line
    const deletePromise: Promise<number> = new Promise((resolve, reject) => {
      deleteService(api, pair, service.id, () => {
        queryServicesCount(api).then((res) => {
          deregisterLab(api, pair, () => {
            resolve(res);
          });
        });
      });
    });

    expect(await deletePromise).toEqual(0);
  }, 180000);
});
