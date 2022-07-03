import {
  createService,
  deleteService,
  deregisterLab,
  Lab,
  queryLabById,
  queryServicesByMultipleIds,
  queryServicesCount,
  registerLab,
  Service,
} from '@debionetwork/polkadot-provider';
import { INestApplication } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DateTimeModule,
  DebioConversionModule,
  MailModule,
  NotificationModule,
  ProcessEnvModule,
  SubstrateModule,
  TransactionLoggingModule,
} from '../../../../../../src/common';
import { EscrowService } from '../../../../../../src/common/modules/escrow/escrow.service';
import { TransactionRequest } from '../../../../../../src/common/modules/transaction-logging/models/transaction-request.entity';
import { LocationModule } from '../../../../../../src/endpoints/location/location.module';
import { LocationEntities } from '../../../../../../src/endpoints/location/models';
import { LabRating } from '../../../../../../src/endpoints/rating/models/rating.entity';
import { ServiceCommandHandlers } from '../../../../../../src/listeners/substrate-listener/commands/services';
import { SubstrateListenerHandler } from '../../../../../../src/listeners/substrate-listener/substrate-listener.handler';
import { dummyCredentials } from '../../../../config';
import { escrowServiceMockFactory } from '../../../../../unit/mock';
import { ApiPromise } from '@polkadot/api';
import { initializeApi } from '../../../../polkadot-init';
import { labDataMock } from '../../../../../mocks/models/labs/labs.mock';
import { serviceDataMock } from '../../../../../mocks/models/labs/services.mock';
import { Notification } from '../../../../../../src/common/modules/notification/models/notification.entity';
import { createConnection } from 'typeorm';

describe('Service Created Integration Tests', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
  let lab: Lab;
  let service: Service;

  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeAll(async () => {
    const modules: TestingModule = await Test.createTestingModule({
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
        ...ServiceCommandHandlers,
      ],
    }).compile();

    app = modules.createNestApplication();
    await app.init();

    const { api: _api, pair: _pair } = await initializeApi();
    api = _api;
    pair = _pair;
  }, 360000);

  afterAll(async () => {
    await api.disconnect();
    await app.close();
  });

  it('service created event', async () => {
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

    expect(service.info).toEqual(serviceDataMock.info);

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
        to: service.ownerId,
      })
      .where('notification.entity = :entity', { entity: 'Add service' })
      .getMany();

    expect(notifications.length).toEqual(1);
    expect(notifications[0].to).toEqual(service.ownerId);
    expect(notifications[0].entity).toEqual('Add service');
    expect(
      notifications[0].description.includes(
        "You've successfully added your new service -",
      ),
    ).toBeTruthy();
    expect(
      notifications[0].description.includes(service.info.name),
    ).toBeTruthy();

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
  }, 120000);
});
