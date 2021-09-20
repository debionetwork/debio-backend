import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { EmrModule } from '../src/emr/emr.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmrCategory } from '../src/emr/models/emr.entity';

describe('EMR Category (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        EmrModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.HOST_POSTGRES,
          port: 5432,
          username: process.env.USERNAME_POSTGRES,
          password: process.env.PASSWORD_POSTGRES,
          database: process.env.DB_POSTGRES,
          entities: [EmrCategory],
          autoLoadEntities: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/emr-category get all category from emr (GET)', () => {
    request(app.getHttpServer())
      .get('/emr-category')
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContaining([{
            id: expect.any(Number),
            category: expect.any(String),
            created_at: expect.any(String)
          }])
        )
      })
  });
});
