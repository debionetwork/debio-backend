import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'http';
import { ServiceCategory } from '../../../../src/endpoints/category/service/models/service-category.service';
import { dummyCredentials } from '../../config';
import { ServiceCategoryModule } from '../../../../src/endpoints/category/service/service-category.module';

describe('Service Category (e2e)', () => {
  let server: Server;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...dummyCredentials,
          name: 'dbLocation',
          database: 'db_location',
          entities: [ServiceCategory],
          autoLoadEntities: true,
        }),
        ServiceCategoryModule,
      ],
    }).compile();
    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('GET /service-category', async () => {
    //Act
    const result = await request(server).get('/service-category').send();
    expect(result.status).toEqual(200);
  }, 25000);
});
