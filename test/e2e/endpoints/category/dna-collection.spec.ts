import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'http';
import { dummyCredentials } from '../../config';
import { DnaCollectionCategory } from '../../../../src/endpoints/category/dna-collection/models/dna-collection.entity';
import { DnaCollectionModule } from '../../../../src/endpoints/category/dna-collection/dna-collection.module';
import { dnaCollectionList } from './dna-collection.mock.data';

describe('Dna Collection Process Category (e2e)', () => {
  let server: Server;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [DnaCollectionCategory],
          autoLoadEntities: true,
        }),
        DnaCollectionModule,
      ],
    }).compile();
    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('GET /dna-collection-process', async () => {
    //Act
    const result = await request(server).get('/dna-collection-process').send();

    const body = result.body as Array<DnaCollectionCategory>;
    expect(body.length).toBeGreaterThan(1);
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: dnaCollectionList[0].name,
        }),
      ]),
    );
    expect(result.status).toEqual(200);
  }, 25000);
});
