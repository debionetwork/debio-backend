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

describe('Health Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;
  let api: SubstrateService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
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
    }).compile();

    api = module.get(SubstrateService);
    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
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
  }, 25000);
});
