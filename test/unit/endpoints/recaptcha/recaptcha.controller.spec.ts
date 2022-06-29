import axios from 'axios';
import { Response } from 'express';
import MockAdapter from 'axios-mock-adapter';
import { TestingModule, Test } from '@nestjs/testing';
import { RecaptchaController } from '../../../../src/endpoints/recaptcha/recaptcha.controller';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';

describe('Recaptcha Controller Unit Tests', () => {
  let recaptchaController: RecaptchaController;
  const axiosMock = new MockAdapter(axios);

  const RECAPTCHA_SECRET_KEY = 'KEY';
  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['RECAPTCHA_SECRET_KEY', RECAPTCHA_SECRET_KEY],
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

    recaptchaController = module.get<RecaptchaController>(RecaptchaController);
    axiosMock.reset();
  });

  it('should be defined', () => {
    // Assert
    expect(recaptchaController).toBeDefined();
  });

  it('should get exchange', async () => {
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
      json: (body: any): any => body, // eslint-disable-line
      status: (code: number) => RESPONSE, // eslint-disable-line
    } as Response;

    // Assert
    expect(await recaptchaController.recaptcha(PAYLOAD, RESPONSE)).toEqual(
      EXPECTED_RESULTS,
    );
  });
});
