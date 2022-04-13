import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'http';
import { ServiceCategory } from '../../../../src/endpoints/category/service/models/service-category.service';
import { dummyCredentials } from '../../config';
import { ServiceCategoryModule } from '../../../../src/endpoints/category/service/service-category.module';
import { serviceList } from '../../data-test';

describe('Service Category (e2e)', () => {
  let server: Server;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...dummyCredentials,
          database: 'db_postgres',
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

    const body = result.body as Array<ServiceCategory>;
    expect(body.length).toBeGreaterThan(1);
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          service_categories: serviceList[0].service_categories,
          name: serviceList[0].name,
        }),
      ]),
    );
    expect(result.status).toEqual(200);
  }, 25000);
});
