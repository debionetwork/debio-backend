import request from 'supertest';
import { Server } from 'http';
import { dummyCredentials } from '../config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { City } from '../../../src/endpoints/location/models/city.entity';
import { State } from '../../../src/endpoints/location/models/state.entity';
import { Country } from '../../../src/endpoints/location/models/country.entity';
import { LocationModule } from '../../../src/endpoints/location/location.module';

describe('Location Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...dummyCredentials,
          name: 'dbLocation',
          database: 'db_location',
          entities: [Country, State, City],
          autoLoadEntities: true,
        }),
        LocationModule,
      ],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('GET /location: getLocation should return', async () => {
    // Arrange
    const COUNTRY_CODE = 'AT';
    const STATE_CODE = '2';
    const CITY_CODE = 1;

    // Act
    const result = await request(server)
      .get(
        `/location?country_code=${COUNTRY_CODE}&state_code=${STATE_CODE}&city_id=${CITY_CODE}`,
      )
      .send();

    // Assert
    expect(result.text.includes(COUNTRY_CODE)).toBeTruthy();
    expect(result.text.includes(STATE_CODE)).toBeTruthy();
    expect(result.text.includes(CITY_CODE.toString())).toBeTruthy();
    expect(result.status).toEqual(200);
  }, 30000);
});
