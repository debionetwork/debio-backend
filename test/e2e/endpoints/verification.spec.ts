import request from 'supertest';
import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  DateTimeModule,
  ProcessEnvProxy,
  RewardModule,
  SubstrateModule,
  SubstrateService,
} from '../../../src/common';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { VerificationModule } from '../../../src/endpoints/verification/verification.module';
import { Keyring } from '@polkadot/api';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from '../../../src/common/modules/reward/models/reward.entity';
import { dummyCredentials } from '../config';

describe('Verification Controller (e2e)', () => {
  let pair: any;
  let server: Server;
  let app: INestApplication;
  let api: SubstrateService;
  const keyring = new Keyring({ type: 'sr25519' });

  const apiKey = 'DEBIO_API_KEY';
  class ProcessEnvProxyMock {
    env = {
      DEBIO_API_KEY: apiKey,
    };
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [Reward],
          autoLoadEntities: true,
        }),
        VerificationModule,
        SubstrateModule,
        RewardModule,
        DateTimeModule,
      ],
      providers: [
        {
          provide: ProcessEnvProxy,
          useClass: ProcessEnvProxyMock,
        },
      ],
    }).compile();

    api = module.get(SubstrateService);
    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();

    await cryptoWaitReady();
    pair = await keyring.addFromUri('//Alice', { name: 'Alice default' });
  });

  afterAll(async () => {
    await api.stopListen();
  });

  it('POST /verification/lab: updateStatusLab should return', async () => {
    // Arrange
    const ACCOUNT_ID = pair.address;
    const VERIFICATION_STATUS = 'Verified';

    // Act
    const result = await request(server)
      .post(
        `/verification/lab?account_id${ACCOUNT_ID}=&verification_status=${VERIFICATION_STATUS}`,
      )
      .set('debio-api-key', apiKey)
      .send();

    // Assert
    expect(result.text.includes(`Lab ${ACCOUNT_ID} ${VERIFICATION_STATUS}`)).toBeTruthy();
    expect(result.status).toEqual(200);
  });

  it('POST /verification/genetic-analysts: updateStatusGeneticAnalyst should return', async () => {
    // Arrange
    const ACCOUNT_ID = pair.address;
    const VERIFICATION_STATUS = 'Verified';

    // Act
    const result = await request(server)
      .post(
        `/verification/genetic-analysts?account_id${ACCOUNT_ID}=&verification_status=${VERIFICATION_STATUS}`,
      )
      .set('debio-api-key', apiKey)
      .send();

    // Assert
    expect(result.text.includes(`Genetic Analyst ${ACCOUNT_ID}`)).toBeTruthy();
    expect(result.status).toEqual(200);
  });
});
