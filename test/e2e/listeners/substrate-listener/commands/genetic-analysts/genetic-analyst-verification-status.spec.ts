import {
  GeneticAnalyst,
  queryGeneticAnalystByAccountId,
  registerGeneticAnalyst,
  stakeGeneticAnalyst,
  updateGeneticAnalystVerificationStatus,
} from '@debionetwork/polkadot-provider';
import { INestApplication } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiPromise } from '@polkadot/api';
import { GeneticAnalystCommandHandlers } from '../../../../../../src/listeners/substrate-listener/commands/genetic-analysts';
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
import { SubstrateListenerHandler } from '../../../../../../src/listeners/substrate-listener/substrate-listener.handler';
import { dummyCredentials } from '../../../../../e2e/config';
import { escrowServiceMockFactory } from '../../../../../unit/mock';
import { initializeApi } from '../../../../../e2e/polkadot-init';
import { geneticAnalystsDataMock } from '../../../../../mocks/models/genetic-analysts/genetic-analysts.mock';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';
import { Notification } from '../../../../../../src/common/modules/notification/models/notification.entity';
import { createConnection } from 'typeorm';
import { StakeStatus } from '@debionetwork/polkadot-provider/lib/primitives/stake-status';

describe('Genetic analyst verification status', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
  let ga: GeneticAnalyst;

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
        ...GeneticAnalystCommandHandlers,
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

  it('create genetic analyst', async () => {
    const geneticAnalystPromise: Promise<GeneticAnalyst> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        registerGeneticAnalyst(api, pair, geneticAnalystsDataMock.info, () => {
          stakeGeneticAnalyst(api, pair, () => {
            queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
              resolve(res);
            });
          });
        });
      },
    );

    ga = await geneticAnalystPromise;

    expect(ga.info).toEqual(
      expect.objectContaining({
        boxPublicKey:
          '0x6d206b37fdbe72caeaf73a50dbe455f146933c26c67e8d279565bfc3076ef90a',
        firstName: 'string',
        lastName: 'string',
        gender: 'string',
        dateOfBirth: '0',
        email: 'string',
        phoneNumber: 'string',
        specialization: 'string',
        profileLink: 'string',
        profileImage: 'string',
      }),
    );

    expect(ga.stakeStatus).toEqual(StakeStatus.Staked);
  }, 120000);

  it('genetic analyst verified', async () => {
    const updateGeneticAnalyst: Promise<GeneticAnalyst> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        updateGeneticAnalystVerificationStatus(
          api,
          pair,
          pair.address,
          VerificationStatus.Verified,
          () => {
            queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
              resolve(res);
            });
          },
        );
      },
    );

    ga = await updateGeneticAnalyst;

    expect(ga.info).toEqual(
      expect.objectContaining({
        boxPublicKey:
          '0x6d206b37fdbe72caeaf73a50dbe455f146933c26c67e8d279565bfc3076ef90a',
        firstName: 'string',
        lastName: 'string',
        gender: 'string',
        dateOfBirth: '0',
        email: 'string',
        phoneNumber: 'string',
        specialization: 'string',
        profileLink: 'string',
        profileImage: 'string',
      }),
    );
    expect(ga.verificationStatus).toEqual(VerificationStatus.Verified);

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
        to: ga.accountId,
      })
      .where('notification.entity = :entity', { entity: 'Account verified' })
      .getMany();

    expect(notifications.length).toEqual(1);
    expect(notifications[0].to).toEqual(ga.accountId);
    expect(notifications[0].entity).toEqual('Account verified');
    expect(
      notifications[0].description.includes(
        'Congrats! Your account has been verified.',
      ),
    ).toBeTruthy();

    dbConnection.destroy();
  }, 120000);

  it('genetic analyst revoke', async () => {
    const updateGeneticAnalyst: Promise<GeneticAnalyst> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        updateGeneticAnalystVerificationStatus(
          api,
          pair,
          pair.address,
          VerificationStatus.Revoked,
          () => {
            queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
              resolve(res);
            });
          },
        );
      },
    );

    ga = await updateGeneticAnalyst;

    expect(ga.info).toEqual(
      expect.objectContaining({
        boxPublicKey:
          '0x6d206b37fdbe72caeaf73a50dbe455f146933c26c67e8d279565bfc3076ef90a',
        firstName: 'string',
        lastName: 'string',
        gender: 'string',
        dateOfBirth: '0',
        email: 'string',
        phoneNumber: 'string',
        specialization: 'string',
        profileLink: 'string',
        profileImage: 'string',
      }),
    );
    expect(ga.verificationStatus).toEqual(VerificationStatus.Revoked);

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
        to: ga.accountId,
      })
      .where('notification.entity = :entity', { entity: 'Account revoked' })
      .getMany();

    expect(notifications.length).toEqual(1);
    expect(notifications[0].to).toEqual(ga.accountId);
    expect(notifications[0].entity).toEqual('Account revoked');
    expect(
      notifications[0].description.includes('Your account has been revoked.'),
    ).toBeTruthy();

    dbConnection.destroy();
  }, 120000);

  it('genetic analyst rejected', async () => {
    const updateGeneticAnalyst: Promise<GeneticAnalyst> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        updateGeneticAnalystVerificationStatus(
          api,
          pair,
          pair.address,
          VerificationStatus.Rejected,
          () => {
            queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
              resolve(res);
            });
          },
        );
      },
    );

    ga = await updateGeneticAnalyst;

    expect(ga.info).toEqual(
      expect.objectContaining({
        boxPublicKey:
          '0x6d206b37fdbe72caeaf73a50dbe455f146933c26c67e8d279565bfc3076ef90a',
        firstName: 'string',
        lastName: 'string',
        gender: 'string',
        dateOfBirth: '0',
        email: 'string',
        phoneNumber: 'string',
        specialization: 'string',
        profileLink: 'string',
        profileImage: 'string',
      }),
    );
    expect(ga.verificationStatus).toEqual(VerificationStatus.Rejected);

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
        to: ga.accountId,
      })
      .where('notification.entity = :entity', { entity: 'Account rejected' })
      .getMany();

    expect(notifications.length).toEqual(1);
    expect(notifications[0].to).toEqual(ga.accountId);
    expect(notifications[0].entity).toEqual('Account rejected');
    expect(
      notifications[0].description.includes(
        'Your account verification has been rejected.',
      ),
    ).toBeTruthy();

    dbConnection.destroy();
  }, 120000);
});
