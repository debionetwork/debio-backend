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
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';

describe('Transaction Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;

  const getData: TransactionHashDto = {
    transaction_hash:
      '0x85a0773882a27912211db04482865b8dfae7d9e31c1cd6d15899ba47b3c30d1e',
    order_id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  };

  const postData: TransactionHashDto = {
    transaction_hash:
      '0x85a0773882a27912211db04482865b8dfae7d9e31c1cd6d15899ba47b3c30d1e',
    order_id: '5FjqD9WgAS3DvxuZYNT7LX8jpPca3yfQXMWMtkmvN8kvFaSs',
  };

  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['ELASTICSEARCH_USERNAME', process.env.ELASTICSEARCH_USERNAME],
      ['ELASTICSEARCH_PASSWORD', process.env.ELASTICSEARCH_PASSWORD],
      ['ADMIN_SUBSTRATE_MNEMONIC', process.env.ADMIN_SUBSTRATE_MNEMONIC],
      ['DEBIO_API_KEY', process.env.DEBIO_API_KEY],
    ]);
    loadSecrets() {
      return null;
    }

    getSecret(key) {
      return this._secretsList.get(key);
    }
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TransactionLoggingModule,
        TransactionModule,
        ElasticsearchModule.registerAsync({
          imports: [GCloudSecretManagerModule.withConfig(process.env.PARENT)],
          inject: [GCloudSecretManagerService],
          useFactory: async (
            gCloudSecretManagerService: GCloudSecretManagerService,
          ) => ({
            node: process.env.ELASTICSEARCH_NODE,
            auth: {
              username: gCloudSecretManagerService
                .getSecret('ELASTICSEARCH_USERNAME')
                .toString(),
              password: gCloudSecretManagerService
                .getSecret('ELASTICSEARCH_PASSWORD')
                .toString(),
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
    })
      .overrideProvider(GCloudSecretManagerService)
      .useClass(GoogleSecretManagerServiceMock)
      .compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('POST /hash : submitTransactionHash should return', async () => {
    // Act
    const result = await request(server)
      .post('/transaction/hash')
      .send(postData);

    // Assert
    expect(result.status).toEqual(201);
    const jsonObject = JSON.parse(result.text);
    expect(jsonObject).toEqual({ status: 'ok' });
  }, 2500);

  it('GET /hash : getTransactionHash should return', async () => {
    // Act
    const result = await request(server)
      .get('/transaction/hash')
      .query({ order_id: getData.order_id })
      .send();

    // Assert
    expect(result.status).toEqual(200);
    const jsonObject = JSON.parse(result.text);
    expect(jsonObject).toEqual(getData);
  }, 2500);
});
