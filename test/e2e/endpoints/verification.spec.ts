import request from 'supertest';
import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  DateTimeModule,
  TransactionLoggingModule,
  SubstrateModule,
  SubstrateService,
  GoogleSecretManagerService,
} from '../../../src/common';
import { VerificationModule } from '../../../src/endpoints/verification/verification.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionRequest } from '../../../src/common/modules/transaction-logging/models/transaction-request.entity';
import { dummyCredentials } from '../config';

describe('Verification Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;
  let api: SubstrateService;

  const apiKey = 'DEBIO_API_KEY';

  class GoogleSecretManagerServiceMock {
    async accessSecret() {
      return null;
    }
    elasticsearchNode = process.env.ELASTICSEARCH_NODE;
    elasticsearchUsername = process.env.ELASTICSEARCH_USERNAME;
    elasticsearchPassword = process.env.ELASTICSEARCH_PASSWORD;
    debioApiKey = apiKey;
    adminSubstrateMnemonic = process.env.ADMIN_SUBSTRATE_MNEMONIC;
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
        TypeOrmModule.forRoot({
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [TransactionRequest],
          autoLoadEntities: true,
        }),
        VerificationModule,
        SubstrateModule,
        TransactionLoggingModule,
        DateTimeModule,
      ],
    })
      .overrideProvider(GoogleSecretManagerService)
      .useClass(GoogleSecretManagerServiceMock)
      .compile();

    api = module.get(SubstrateService);
    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  afterAll(async () => {
    await api.stopListen();
    api.destroy();
  });

  it('POST /verification/lab: updateStatusLab should return', async () => {
    // Arrange
    const ACCOUNT_ID = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    const VERIFICATION_STATUS = 'Unverified';

    // Act
    const result = await request(server)
      .post(
        `/verification/lab?account_id=${ACCOUNT_ID}&verification_status=${VERIFICATION_STATUS}`,
      )
      .set('debio-api-key', apiKey)
      .send();

    // Assert
    expect(
      result.text.includes(`Lab ${ACCOUNT_ID} ${VERIFICATION_STATUS}`),
    ).toBeTruthy();
    expect(result.status).toEqual(200);
  }, 60000);

  it('POST /verification/genetic-analysts: updateStatusGeneticAnalyst should return', async () => {
    // Arrange
    const ACCOUNT_ID = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    const VERIFICATION_STATUS = 'Verified';

    // Act
    const result = await request(server)
      .post(
        `/verification/genetic-analysts?account_id=${ACCOUNT_ID}&verification_status=${VERIFICATION_STATUS}`,
      )
      .set('debio-api-key', apiKey)
      .send();

    // Assert
    expect(result.text.includes(`Genetic Analyst ${ACCOUNT_ID}`)).toBeTruthy();
    expect(result.status).toEqual(200);
  }, 30000);
});
