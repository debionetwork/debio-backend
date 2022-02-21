import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from '../src/location/models/city.entity';
import { Country } from '../src/location/models/country.entity';
import { State } from '../src/location/models/state.entity';
import { EthereumIndexedDataModule } from '../src/ethereum-indexed-data/ethereum-indexed-data.module';

describe('Service Request Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        EthereumIndexedDataModule,
        TypeOrmModule.forRoot({
          name: 'dbLocation',
          type: 'postgres',
          host: process.env.HOST_POSTGRES,
          port: 5432,
          username: process.env.USERNAME_POSTGRES,
          password: process.env.PASSWORD_POSTGRES,
          database: process.env.DB_LOCATIONS,
          entities: [City, Country, State],
          autoLoadEntities: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/Service Request get all', () => {
    request(app.getHttpServer())
      .get('/service-requests/countries')
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContaining([
            {
              country: expect.any(String),
              totalRequests: expect.any(Number),
              totalValue: expect.any(String),
              services: expect.arrayContaining([
                {
                  name: expect.any(String),
                  totalRequests: expect.any(Number),
                  totalValue: {
                    dai: expect.any(String),
                    usd: expect.any(String),
                  },
                },
              ]),
            },
          ]),
        );
      });
  });
});
