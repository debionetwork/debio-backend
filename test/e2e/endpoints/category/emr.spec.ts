import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'http';
import { EmrModule } from '../../../../src/endpoints/category/emr/emr.module';
import { EmrCategory } from '../../../../src/endpoints/category/emr/models/emr.entity';
import { dummyCredentials } from '../../config';
import { emrList } from './emr.mock.data';

describe('EMR Category (e2e)', () => {
  let server: Server;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [EmrCategory],
          autoLoadEntities: true,
        }),
        EmrModule,
      ],
    }).compile();
    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('GET /emr-category', async () => {
    //Act
    const result = await request(server).get('/emr-category').send();

    const body = result.body as Array<EmrCategory>;
    expect(body.length).toBeGreaterThan(1);
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: emrList[0].category,
        }),
      ]),
    );
    expect(result.status).toEqual(200);
  }, 25000);
});
