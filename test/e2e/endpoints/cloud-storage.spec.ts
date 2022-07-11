import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import { CloudStorageModule } from '../../../src/endpoints/cloud-storage/cloud-storage.module';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { cryptoWaitReady } from '@polkadot/util-crypto';

require('dotenv').config(); // eslint-disable-line

describe('Cloud Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;

  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['BUCKET_NAME', process.env.BUCKET_NAME],
      ['STORAGE_BASE_URI', process.env.STORAGE_BASE_URI],
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
        CloudStorageModule,
        GCloudSecretManagerModule.withConfig(process.env.PARENT),
      ],
    })
      .overrideProvider(GCloudSecretManagerService)
      .useClass(GoogleSecretManagerServiceMock)
      .compile();

    await cryptoWaitReady();
    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('GET /gcs/signed-url: GetSignedUrl should return', async () => {
    // Act
    const FILENAME = 'example.txt';
    const ACTION = 'write';
    const result = await request(server)
      .get(`/gcs/signed-url?filename=${FILENAME}&action=${ACTION}`)
      .send();
    // Assert
    expect(result.status).toEqual(200);
    expect(result.text.includes('signedUrl')).toEqual(true);
  }, 30000);
});
