import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from 'supertest';
import { TypeOrmModule } from "@nestjs/typeorm";
import { City } from "src/location/models/city.entity";
import { Country } from "src/location/models/country.entity";
import { State } from "src/location/models/state.entity";
import { LocationModule } from "../src/location/location.module";

describe('Rating Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        LocationModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.HOST_POSTGRES,
          port: 5432,
          username: process.env.USERNAME_POSTGRES,
          password: process.env.PASSWORD_POSTGRES,
          database: process.env.DB_POSTGRES,
          entities: [City, Country, State],
          autoLoadEntities: true,
        }),
      ],
    })  
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/location get all country', () => {
    request(app.getHttpServer())
      .get('/location')
      .expect(200)
      // .then((response) => {
      //   expect(response.body).toHaveProperty('status')
      // })
  });

  // it('/rating (GET) by lab_id "3" success get from cache', () => {
  //   request(app.getHttpServer())
  //     .get('/rating/3')
  //     .then((response) => {
  //       expect(response.body).toEqual({
  //         status: 'ok',
  //         data : expect.any(Object)
  //       })
  //     })
  // });

  // it('/rating (GET) by lab_id "zzzz" rating will be null', () => {
  //   request(app.getHttpServer())
  //     .get('/rating/zzzz')
  //     .then((response) => {
  //       expect(response.body).toEqual({
  //         status: 'ok',
  //         data : {
  //           lab_id: 'zzzz',
  //           rating: null
  //         }
  //       })
  //     })
  // });
});