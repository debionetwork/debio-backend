import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import { DateTimeModule } from '../../../src/common/modules/proxies/date-time';
import { GCloudStorageModule } from '@aginix/nestjs-gcloud-storage';
import { CloudStorageModule } from '../../../src/endpoints/cloud-storage/cloud-storage.module';

describe('Cloud Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CloudStorageModule,
        GCloudStorageModule.withConfig({
          defaultBucketname: process.env.BUCKET_NAME,
          storageBaseUri: process.env.STORAGE_BASE_URI,
          predefinedAcl: 'private',
        }),
        DateTimeModule,
      ],
    }).compile();

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
  }, 25000);
});
