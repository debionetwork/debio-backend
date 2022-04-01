import request from 'supertest';
import 'regenerator-runtime/runtime';
import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DateTimeModule } from '../../../src/common/modules/proxies/date-time';
import { LocationModule } from '../../../src/endpoints/location/location.module';
import {
  DebioConversionModule,
  ProcessEnvProxy,
  RewardModule,
  SubstrateModule,
} from '../../../src/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dummyCredentials } from '../config';
import { Reward } from '../../../src/common/modules/reward/models/reward.entity';
import { Country } from '../../../src/endpoints/location/models/country.entity';
import { State } from '../../../src/endpoints/location/models/state.entity';
import { City } from '../../../src/endpoints/location/models/city.entity';
import { SubstrateEndpointModule } from '../../../src/endpoints/substrate-endpoint/substrate-endpoint.module';

describe('Substrate Endpoint Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;

  const apiKey = 'DEBIO_API_KEY';
  class ProcessEnvProxyMock {
    env = {
      DEBIO_API_KEY: apiKey,
    };
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SubstrateEndpointModule,
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
      providers: [
        {
          provide: ProcessEnvProxy,
          useClass: ProcessEnvProxyMock,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('GET /substrate/labs: findByCountryCityCategory should return', async () => {
    // Arrange
    const COUNTRY = 'ID';
    const REGION = 'BA';
    const CITY = 'Denpasar';
    const CATEGORY = 'Single Gene';
    const SERVICE_FLOW = 'RequestTest';

    // Act
    const result = await request(server)
      .get(
        `/substrate/labs?country=${COUNTRY}&region=${REGION}&city=${CITY}&category=${CATEGORY}&service_flow=${SERVICE_FLOW}`,
      )
      .send();

    // Assert
    expect(result.text.includes(COUNTRY)).toBeTruthy();
    expect(result.text.includes(REGION)).toBeTruthy();
    expect(result.text.includes(CITY)).toBeTruthy();
    expect(result.text.includes(CATEGORY)).toBeTruthy();
    expect(result.text.includes(SERVICE_FLOW)).toBeTruthy();
    expect(result.status).toEqual(200);
  }, 25000);

  it('GET /substrate/services: findByCountryCity should return', async () => {
    // Arrange
    const COUNTRY = 'ID';
    const CITY = 'Denpasar';

    // Act
    const result = await request(server)
      .get(`/substrate/services/${COUNTRY}/${CITY}`)
      .send();

    // Assert
    expect(result.text.includes(COUNTRY)).toBeTruthy();
    expect(result.text.includes(CITY)).toBeTruthy();
    expect(result.status).toEqual(200);
  }, 25000);

  it('GET /substrate/countries: findByCountryCity should return', async () => {
    // Arrange
    const COUNTRY = 'ID';
    const CITY = 'Kota Administrasi Jakarta Barat';
    const BLOCKHASH =
      '0x3f314d6ef05403a6a2edee59b67e1cc1b6b1053ee65d2ff6ff759bccd28c4d98';

    // Act
    const result = await request(server).get(`/substrate/countries`).send();

    // Assert
    console.log(result.text);
    expect(result.text.includes(COUNTRY)).toBeTruthy();
    expect(result.text.includes(CITY)).toBeTruthy();
    expect(result.status).toEqual(200);
  }, 25000);
});
