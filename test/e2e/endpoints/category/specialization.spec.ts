import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'http';
import { dummyCredentials } from '../../config';
import { SpecializationCategory } from '../../../../src/endpoints/category/specialization/models/specialization.entity';
import { SpecializationModule } from '../../../../src/endpoints/category/specialization/specialization.module';
import { specializationList } from './specialization.mock.data';

describe('Specialization Category (e2e)', () => {
  let server: Server;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [SpecializationCategory],
          autoLoadEntities: true,
        }),
        SpecializationModule,
      ],
    }).compile();
    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('GET /specialization-category', async () => {
    //Act
    const result = await request(server).get('/specialization-category').send();

    const body = result.body as Array<SpecializationCategory>;
    expect(body.length).toBeGreaterThan(1);
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: specializationList[0].category,
        }),
      ]),
    );
    expect(result.status).toEqual(200);
  }, 25000);
});
