import request from 'supertest';
import 'regenerator-runtime/runtime';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule, INestApplication } from '@nestjs/common';
import { Server } from 'http';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingModule } from '../../../src/endpoints/rating/rating.module';
import { LabRating } from '../../../src/endpoints/rating/models/rating.entity';
import { DateTimeModule } from '../../../src/common/modules/proxies/date-time';
import { CreateRatingDto } from 'src/endpoints/rating/dto/create-rating.dto';

describe('Rating Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;

  const data: CreateRatingDto = {
    lab_id: 'LAB_ID',
    order_id: 'ORDER_ID',
    service_id: 'SERVICE_ID',
    rating: 1,
    rating_by: 'RATING_BY',
    review: 'REVIEW',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        RatingModule,
        CacheModule.register(),
        DateTimeModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: '127.0.0.1',
          port: 5432,
          username: 'postgres',
          password: 'root',
          database: 'db_postgres',
          entities: [LabRating],
          autoLoadEntities: true,
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('POST /rating: create should return', async () => {
    // Act
    const result = await request(server).post('/rating').send(data);

    // Assert
    expect(result.status).toEqual(201);
    const jsonObject = JSON.parse(result.text);
    const dtoEqual: CreateRatingDto = {
      ...jsonObject,
    };
    expect(jsonObject).toEqual(dtoEqual);
  }, 25000);

  it('GET /rating/order/:order_id: getByCustomer should return', async () => {
    // Act
    const result = await request(server).get(`/rating/order/${data.order_id}`);

    // Assert
    expect(result.status).toEqual(200);
    const jsonObject = JSON.parse(result.text);
    const dtoEqual: CreateRatingDto = {
      ...jsonObject,
    };
    expect(jsonObject).toEqual(dtoEqual);
  }, 25000);

  it('GET /rating/service: getAllService should return', async () => {
    // Act
    const result = await request(server).get(`/rating/service`);

    // Assert
    expect(result.status).toEqual(200);
    const jsonObject = JSON.parse(result.text);
    expect(jsonObject[0].lab_id).toEqual(data.lab_id);
    expect(jsonObject[0].rating_lab).toEqual(data.rating);
    expect(jsonObject[0].sum_rating_lab).toEqual(1);
    expect(jsonObject[0].count_rating_lab).toEqual(1);
  }, 25000);

  it('GET /rating/service/:service_id: getByServiceId should return', async () => {
    // Act
    const result = await request(server).get(
      `/rating/service/${data.service_id}`,
    );

    // Assert
    expect(result.status).toEqual(200);
    const jsonObject = JSON.parse(result.text);
    expect(jsonObject.service_id).toEqual(data.service_id);
    expect(jsonObject.sum_rating_service).toEqual(data.rating);
    expect(jsonObject.count_rating_service).toEqual(1);
  }, 25000);

  it('GET /rating/lab/:lab_id: getLabRating should return', async () => {
    // Act
    const result = await request(server).get(`/rating/lab/${data.lab_id}`);

    // Assert
    expect(result.status).toEqual(200);
    const jsonObject = JSON.parse(result.text);
    expect(jsonObject.lab_id).toEqual(data.lab_id);
    expect(jsonObject.rating).toEqual(data.rating);
    expect(jsonObject.sum).toEqual(1);
    expect(jsonObject.count).toEqual(1);
  }, 25000);
});
