import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { BountyModule } from '../src/bounty/bounty.module';
import { DataBounty } from '../src/bounty/models/bounty.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

describe('Bounty Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        BountyModule,
        ElasticsearchModule.registerAsync({
          useFactory: async () => ({
            node: process.env.ELASTICSEARCH_NODE,
          }),
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.HOST_POSTGRES,
          port: 5432,
          username: process.env.USERNAME_POSTGRES,
          password: process.env.PASSWORD_POSTGRES,
          database: process.env.DB_POSTGRES,
          entities: [DataBounty],
          autoLoadEntities: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/bounty (POST) create data bounty to database', async () => {
    const response = await request(app.getHttpServer()).post('/bounty').send({
      bounty_ocean: 'hello world',
    });

    expect(response.statusCode).toEqual(201);

    expect(response.body).toEqual({
      data: expect.any(Object),
    });
  });
});
