import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceService } from '../src/substrate-indexed-data/services/service.service';
import { ServiceController } from '../src/substrate-indexed-data/services/service.controller';

describe('subtrate indexed data Services controller (e2e)', () => {
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
      controllers: [ServiceController],
      providers: [ServiceService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/services/:country/:city/ elastic search', () => {
    request(app.getHttpServer())
      .get('/services/ID/ID-JK')
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          body: expect.anything(),
          statusCode: 200,
          headers: expect.anything(),
          meta: expect.anything(),
        });
      });
  });

  it('/services/ without params', () => {
    request(app.getHttpServer())
      .get('/services')
      .expect(404)
      .then((response) => {
        expect(response.body).toHaveProperty('error');
      });
  });
});
