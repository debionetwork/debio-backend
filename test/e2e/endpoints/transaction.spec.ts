import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionLoggingModule } from '../../../src/common';
import { Server } from 'http';
import { TransactionModule } from '../../../src/endpoints/transaction/transaction.module';
import { TransactionHashDto } from '../../../src/endpoints/transaction/dto/transaction-hash.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionRequest } from '../../../src/common/modules/transaction-logging/models/transaction-request.entity';
import { dummyCredentials } from '../config';

describe('Transaction Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;

  const data: TransactionHashDto = {
    transaction_hash:
      '0x85a0773882a27912211db04482865b8dfae7d9e31c1cd6d15899ba47b3c30d1e',
    order_id: '5FjqD9WgAS3DvxuZYNT7LX8jpPca3yfQXMWMtkmvN8kvFaSs',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TransactionLoggingModule,
        TransactionModule,
        ElasticsearchModule.registerAsync({
          useFactory: async () => ({
            node: process.env.ELASTICSEARCH_NODE,
            auth: {
              username: process.env.ELASTICSEARCH_USERNAME,
              password: process.env.ELASTICSEARCH_PASSWORD,
            },
          }),
        }),
        TypeOrmModule.forRoot({
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [TransactionRequest],
          autoLoadEntities: true,
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('POST /hash : submitTransactionHash should return', async () => {
    // Act
    const result = await request(server).post('/transaction/hash').send(data);

    // Assert
    expect(result.status).toEqual(201);
    const jsonObject = JSON.parse(result.text);
    expect(jsonObject).toEqual({ status: 'ok' });
  }, 2500);

  it('GET /hash : getTransactionHash should return', async () => {
    // Act
    const result = await request(server)
      .get('/transaction/hash')
      .query({ order_id: '' })
      .send(data);

    // Assert
    expect(result.status).toEqual(200);
    const jsonObject = JSON.parse(result.text);
    expect(jsonObject).toEqual(data);
  }, 2500);
});
