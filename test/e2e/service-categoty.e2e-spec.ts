import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCategory } from '../src/category/service/models/service-category.service';
import request from 'supertest';
import { ServiceCategoryModule } from '../src/category/service/service-category.module';

describe('Service Category (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ServiceCategoryModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.HOST_POSTGRES,
          port: 5432,
          username: process.env.USERNAME_POSTGRES,
          password: process.env.PASSWORD_POSTGRES,
          database: process.env.DB_POSTGRES,
          entities: [ServiceCategory],
          autoLoadEntities: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/service-category get all category from service (GET)', () => {
    request(app.getHttpServer())
      .get('/service-category')
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContaining([
            {
              id: expect.any(Number),
              service_categories: expect.any(String),
              name: expect.any(String),
              ticker: expect.any(String),
              created_at: expect.any(String),
            },
          ]),
        );
      });
  });
});
