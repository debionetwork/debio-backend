import axios from 'axios';
import request from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import { Server } from 'http';
import { Response } from 'express';
import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { RecaptchaController } from '../../../src/endpoints/recaptcha/recaptcha.controller';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';

describe('Recaptcha Controller (e2e)', () => {
  const axiosMock = new MockAdapter(axios);
  let server: Server;
  let app: INestApplication;

  const RECAPTCHA_SECRET_KEY = 'KEY';
  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['RECAPTCHA_SECRET_KEY', RECAPTCHA_SECRET_KEY],
      ['REDIS_HOST', process.env.HOST_REDIS],
      ['REDIS_PORT', process.env.PORT_REDIS],
      ['REDIS_PASSWORD', process.env.REDIS_PASSWORD],
    ]);
    loadSecrets() {
      return null;
    }

    getSecret(key) {
      return this._secretsList.get(key);
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecaptchaController],
      providers: [
        {
          provide: GCloudSecretManagerService,
          useClass: GoogleSecretManagerServiceMock,
        },
      ],
    }).compile();

    axiosMock.reset();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('GET /recaptcha: recaptcha should return', async () => {
    // Arrange
    const PAYLOAD = {
      response: 'RESPONSE',
    };
    const EXPECTED_RESULTS = 1;
    axiosMock
      .onPost(
        'https://www.google.com/recaptcha/api/siteverify' +
          '?secret=' +
          RECAPTCHA_SECRET_KEY +
          '&response=' +
          PAYLOAD.response,
      )
      .reply(200, EXPECTED_RESULTS);
    const RESPONSE: Response = {
      json: (body: any): any => body,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      status: (code: number) => RESPONSE,
    } as Response;

    // Act
    const result = await request(server).post('/recaptcha').send(PAYLOAD);

    // Assert
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('1');
  }, 30000);
});
