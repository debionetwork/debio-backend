import { ApiPromise } from '@polkadot/api';
import 'regenerator-runtime/runtime';
import {
  queryLastOrderHashByCustomer,
  queryOrderDetailByOrderID,
} from '@debionetwork/polkadot-provider/lib/query/labs/orders';
import { createOrder } from '@debionetwork/polkadot-provider/lib/command/labs/orders';
import {
  processDnaSample,
  rejectDnaSample,
  submitTestResult,
} from '@debionetwork/polkadot-provider/lib/command/labs/genetic-testing';
import { createService } from '@debionetwork/polkadot-provider/lib/command/labs/services';
import {
  queryDnaSamples,
  queryLabById,
} from '@debionetwork/polkadot-provider/lib/query/labs';
import { queryServicesByMultipleIds } from '@debionetwork/polkadot-provider/lib/query/labs/services';
import { Lab } from '@debionetwork/polkadot-provider/lib/models/labs';
import {
  registerLab,
  updateLabVerificationStatus,
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
import { OrderCommandHandlers } from '../../../../../../src/listeners/substrate-listener/commands/orders';
import { Notification } from '../../../../../../src/common/modules/notification/models/notification.entity';
import { createConnection } from 'typeorm';
import { DnaSample } from '@debionetwork/polkadot-provider/lib/models/labs/genetic-testing/dna-sample';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';

describe('Order Failed Integration Tests', () => {
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
        ...OrderCommandHandlers,
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

  it('failed order event', async () => {
    // eslint-disable-next-line
    const labPromise: Promise<Lab> = new Promise((resolve, reject) => {
      registerLab(api, pair, labDataMock.info, () => {
        updateLabVerificationStatus(
          api,
          pair,
          pair.address,
          VerificationStatus.Verified,
          () => {
            queryLabById(api, pair.address).then((res) => {
              resolve(res);
            });
          },
        );
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
      DnaSampleStatus.Arrived,
    );
    const rejectedTitle = 'REJECTED';
    const rejectedDescription = 'REJECTED_DESCRIPTION';

    const rejectDnaSamplePromise: Promise<DnaSample> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        rejectDnaSample(
          api,
          pair,
          order.dnaSampleTrackingId,
          rejectedTitle,
          rejectedDescription,
          () => {
            queryDnaSamples(api, order.dnaSampleTrackingId).then((res) => {
              resolve(res);
            });
          },
        );
      },
    );

    const dnaSample = await rejectDnaSamplePromise;
    expect(dnaSample.labId).toEqual(order.sellerId);
    expect(dnaSample.ownerId).toEqual(order.customerId);
    expect(dnaSample.trackingId).toEqual(order.dnaSampleTrackingId);
    expect(dnaSample.status).toEqual(DnaSampleStatus.Rejected);
    expect(dnaSample.rejectedTitle).toEqual(rejectedTitle);
    expect(dnaSample.rejectedDescription).toEqual(rejectedDescription);

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
        to: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      })
      .where('notification.entity = :entity', { entity: 'Order Failed' })
      .getMany();

    expect(notifications.length).toEqual(1);
    expect(notifications[0].to).toEqual(
      '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    );
    expect(notifications[0].entity).toEqual('Order Failed');
    expect(
      notifications[0].description.includes("You've received"),
    ).toBeTruthy();
    expect(
      notifications[0].description.includes('DAI as quality control fees for'),
    ).toBeTruthy();
  }, 120000);
});
