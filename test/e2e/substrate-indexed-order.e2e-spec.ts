import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '../src/substrate-indexed-data/orders/order.controller';
import { OrderService } from '../src/substrate-indexed-data/orders/order.service';

describe('subtrate indexed data order controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ElasticsearchModule.registerAsync({
          useFactory: async () => ({
            node: process.env.ELASTICSEARCH_NODE,
          }),
        }),
      ],
      controllers: [OrderController],
      providers: [OrderService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/orders/:customer_id elastic search by lab name', () => {
    request(app.getHttpServer())
      .get('/orders/5ESGhRuAhECXu96Pz9L8pwEEd1AeVhStXX67TWE1zHRuvJNU')
      .query({ keyword: 'Laboratorium DNA Favourite' })
      .query({ page: 1 })
      .query({ size: 20 })
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          info: {
            page: expect.any(String),
            count: expect.any(Number),
          },
          data: expect.anything(),
        });
      });
  });

  it('/orders/ without customer_id params', () => {
    request(app.getHttpServer())
      .get('/orders')
      .query({ keyword: 'Laboratorium DNA Favourite' })
      .query({ page: 1 })
      .query({ size: 20 })
      .expect(404)
      .then((response) => {
        expect(response.body).toHaveProperty('error');
      });
  });
});
