import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import {
  EmailNotification,
  EmailNotificationModule,
  MailerManager,
  MailModule,
  SubstrateModule,
  SubstrateService,
} from '../../../src/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dummyCredentials } from '../config';
import { EmailEndpointModule } from '../../../src/endpoints/email/email.module';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';

require('dotenv').config(); // eslint-disable-line

describe('Email Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;
  let substrateService: SubstrateService;
  let mailerManager: MailerManager;

  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['ELASTICSEARCH_NODE', process.env.ELASTICSEARCH_NODE],
      ['ELASTICSEARCH_USERNAME', process.env.ELASTICSEARCH_USERNAME],
      ['ELASTICSEARCH_PASSWORD', process.env.ELASTICSEARCH_PASSWORD],
      ['ADMIN_SUBSTRATE_MNEMONIC', process.env.ADMIN_SUBSTRATE_MNEMONIC],
      ['SUBSTRATE_URL', process.env.SUBSTRATE_URL],
      ['EMAIL', process.env.EMAIL],
      ['EMAILS', process.env.EMAILS],
      ['PASS_EMAIL', process.env.PASS_EMAIL],
      ['POSTGRES_HOST', 'localhost'],
    ]);
    loadSecrets() {
      return null;
    }

    getSecret(key) {
      return this._secretsList.get(key);
    }
  }

  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        GCloudSecretManagerModule.withConfig(process.env.PARENT),
        TypeOrmModule.forRoot({
          name: 'default',
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [EmailNotification],
          autoLoadEntities: true,
        }),
        MailModule,
        SubstrateModule,
        EmailNotificationModule,
        EmailEndpointModule,
      ],
    })
      .overrideProvider(GCloudSecretManagerService)
      .useClass(GoogleSecretManagerServiceMock)
      .compile();

    substrateService = module.get(SubstrateService);
    mailerManager = module.get(MailerManager);

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  }, 60000);

  it('POST registered-lab/:lab_id: should return sendMailRegisteredLab', async () => {
    // Act
    const sendLabRegistrationEmailSpy = jest.spyOn(
      mailerManager,
      'sendLabRegistrationEmail',
    );
    sendLabRegistrationEmailSpy.mockImplementation(() => Promise.resolve(true));

    const result = await request(server)
      .post(`/email/registered-lab/${substrateService.pair.address}`)
      .send();

    expect(sendLabRegistrationEmailSpy).toBeCalled();
    expect(result.status).toEqual(200);
    expect(result.body).toEqual(
      expect.objectContaining({
        message: 'Sending Email.',
      }),
    );
  });
});
