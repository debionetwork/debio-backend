import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { LabController } from '../src/substrate-indexed-data/labs/lab.controller';
import { LabService } from '../src/substrate-indexed-data/labs/lab.service';

describe('subtrate indexed data lab controller (e2e)', () => {
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
      controllers: [LabController],
      providers: [LabService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/labs/:country/:city/:category elastic search', () => {
    request(app.getHttpServer())
      .get('/labs/ID/ID-JK/Whole-Genome Sequencing')
      .query({ page: 1 })
      .query({ size: 20 })
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

  it('/labs/ without params', () => {
    request(app.getHttpServer())
      .get('/labs')
      .query({ page: 1 })
      .query({ size: 20 })
      .expect(404)
      .then((response) => {
        expect(response.body).toHaveProperty('error');
      });
  });
});
