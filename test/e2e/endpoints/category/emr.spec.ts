import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'http';
import { EmrModule } from 'src/endpoints/category/emr/emr.module';
import { EmrCategory } from 'src/endpoints/category/emr/models/emr.entity';
import { dummyCredentials } from 'test/e2e/config';

describe('EMR Category (e2e)', () => {
  let server: Server;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...dummyCredentials,
          name: 'dbLocation',
          database: 'db_location',
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
    expect(result.status).toEqual(200);
  }, 25000);
});
