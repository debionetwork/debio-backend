import request from 'supertest';
import 'regenerator-runtime/runtime';
import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DateTimeModule } from '../../../src/common/modules/proxies/date-time';
import { LocationModule } from '../../../src/endpoints/location/location.module';
import { DebioConversionModule, RewardModule, SubstrateModule } from '../../../src/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { labDataMock } from '../../mocks/models/labs/labs.mock';
import { serviceDataMock } from '../../mocks/models/labs/services.mock';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dummyCredentials } from '../config';
import { Reward } from '../../../src/common/modules/reward/models/reward.entity';
import { Country } from '../../../src/endpoints/location/models/country.entity';
import { State } from '../../../src/endpoints/location/models/state.entity';
import { City } from '../../../src/endpoints/location/models/city.entity';

describe('Substrate Endpoint Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [Reward],
          autoLoadEntities: true,
        }),
        TypeOrmModule.forRoot({
          ...dummyCredentials,
          name: 'dbLocation',
          database: 'db_location',
          entities: [Country, State, City],
          autoLoadEntities: true,
        }),
        LocationModule,
        DebioConversionModule,
        ElasticsearchModule.registerAsync({
          useFactory: async () => ({
            node: process.env.ELASTICSEARCH_NODE,
            auth: {
              username: process.env.ELASTICSEARCH_USERNAME,
              password: process.env.ELASTICSEARCH_PASSWORD,
            },
          }),
        }),
        SubstrateModule,
        RewardModule,
        DateTimeModule,
      ],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('GET /substrate/labs: findByCountryCityCategory should return', async () => {
    // Arrange
    const COUNTRY = labDataMock.info.country;
    const REGION = labDataMock.info.region;
    const CITY = labDataMock.info.city;
    const CATEGORY = serviceDataMock.info.category;
    const SERVICE_FLOW = serviceDataMock.serviceFlow;

    // Act
    const result = await request(server)
      .get(`/substrate/labs?country=${COUNTRY}&region=${REGION}&city=${CITY}&category=${CATEGORY}&service_flow=${SERVICE_FLOW}`)
      .send();

    // Assert
    console.log(result.text);
    expect(result.status).toEqual(200);
  }, 25000);
});
