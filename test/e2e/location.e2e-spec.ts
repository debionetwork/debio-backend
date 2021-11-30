import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from '../src/location/models/city.entity';
import { Country } from '../src/location/models/country.entity';
import { State } from '../src/location/models/state.entity';
import { LocationModule } from '../src/location/location.module';
import { Any } from 'typeorm';

describe('Rating Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        LocationModule,
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

  it('/location get all country', () => {
    request(app.getHttpServer()).get('/location').expect(200);
  });

  it('/location get all state in selected country', () => {
    request(app.getHttpServer())
      .get('/location')
      .query({ country_code: 'ID' })
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          status: 'ok',
          data: expect.arrayContaining([
            {
              id: expect.any(Number),
              country_code: expect.any(String),
              country_id: expect.any(Number),
              latitude: expect.any(Number),
              longitude: expect.any(Number),
              name: expect.any(String),
              state_code: expect.any(String),
            },
          ]),
        });
      });
  });

  it('/location get all city in selected state', () => {
    request(app.getHttpServer())
      .get('/location')
      .query({
        country_code: 'ID',
        state_code: 'JK',
      })
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          status: 'ok',
          data: expect.arrayContaining([
            {
              id: expect.any(Number),
              country_code: expect.any(String),
              country_id: expect.any(Number),
              latitude: expect.any(Number),
              longitude: expect.any(Number),
              name: expect.any(String),
              state_code: expect.any(String),
              state_id: expect.any(Number),
            },
          ]),
        });
      });
  });

  it('/location get selected city by id', () => {
    request(app.getHttpServer())
      .get('/location')
      .query({ city_id: 56772 })
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          status: 'ok',
          data: {
            id: expect.any(Number),
            country_code: expect.any(String),
            country_id: expect.any(Number),
            latitude: expect.any(Number),
            longitude: expect.any(Number),
            name: expect.any(String),
            state_code: expect.any(String),
            state_id: expect.any(Number),
          },
        });
      });
  });
});
