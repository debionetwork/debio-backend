import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import { DataStakingEvents } from '../../../src/endpoints/bounty/models/data-staking-events.entity';
import { DataTokenToDatasetMapping } from '../../../src/endpoints/bounty/models/data-token-to-dataset-mapping.entity';
import { dummyCredentials } from '../config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { SubstrateHealthModule } from '../../../src/common/modules/health-indicators/substrate.health';
import { ElasticsearchHealthModule } from '../../../src/common/modules/health-indicators/elasticsearch.health';
import { HealthModule } from '../../../src/endpoints/health/health.module';
import { LocationEntities } from '../../../src/endpoints/location/models';
import { LabRating } from '../../../src/endpoints/rating/models/rating.entity';
import { TransactionRequest } from '../../../src/common/modules/transaction-logging/models/transaction-request.entity';
import { SubstrateService } from '../../../src/common/modules/substrate/substrate.service';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { SecretKeyList } from '../../../src/common/secrets';

describe('Health Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;
  let api: SubstrateService;

  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['ELASTICSEARCH_NODE', process.env.ELASTICSEARCH_NODE],
      ['ELASTICSEARCH_USERNAME', process.env.ELASTICSEARCH_USERNAME],
      ['ELASTICSEARCH_PASSWORD', process.env.ELASTICSEARCH_PASSWORD],
      ['ADMIN_SUBSTRATE_MNEMONIC', process.env.ADMIN_SUBSTRATE_MNEMONIC],
      ['SUBSTRATE_URL', process.env.SUBSTRATE_URL],
      ['EMAIL', process.env.EMAIL],
      ['PASS_EMAIL', process.env.PASS_EMAIL],
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
        GCloudSecretManagerModule.withConfig(process.env.PARENT, SecretKeyList),
        TypeOrmModule.forRoot({
          name: 'default',
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [
            LabRating,
            TransactionRequest,
            DataStakingEvents,
            DataTokenToDatasetMapping,
          ],
          autoLoadEntities: true,
        }),
        TypeOrmModule.forRoot({
          ...dummyCredentials,
          name: 'dbLocation',
          database: 'db_location',
          entities: [...LocationEntities],
          autoLoadEntities: true,
        }),
        TerminusModule,
        ElasticsearchHealthModule,
        SubstrateHealthModule,
        HealthModule,
      ],
    })
      .overrideProvider(GCloudSecretManagerService)
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

  it('GET /health: check should return', async () => {
    // Act
    const result = await request(server).get('/health').send();
    const stringResult = JSON.stringify(result);

    await api.stopListen();

    // Assert
    // prettier-ignore
    expect(
      stringResult.includes('\\\"database\\\":{\\\"status\\\":\\\"up\\\"}'),
    ).toEqual(true);
    // prettier-ignore
    expect(
      stringResult.includes('\\\"location-database\\\":{\\\"status\\\":\\\"up\\\"}'),
    ).toEqual(true);
    // prettier-ignore
    expect(
      stringResult.includes('\\\"elasticsearch\\\":{\\\"status\\\":\\\"up\\\"}'),
    ).toEqual(true);
    // prettier-ignore
    expect(
      stringResult.includes('\\\"substrate-node\\\":{\\\"status\\\":\\\"up\\\"}'),
    ).toEqual(true);
  }, 30000);
});
