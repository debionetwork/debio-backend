import { Test, TestingModule } from "@nestjs/testing";
import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import { EmailNotification, EmailNotificationModule, MailerManager, MailModule, ProcessEnvModule, SubstrateModule, SubstrateService } from "../../../src/common";
import request from 'supertest';
import { TypeOrmModule } from "@nestjs/typeorm";
import { dummyCredentials } from "../config";
import { EmailEndpointModule } from "../../../src/endpoints/email/email.module";

describe('Email Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;
  let substrateService: SubstrateService;
  let mailerManager: MailerManager;

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
        TypeOrmModule.forRoot({
          name: 'default',
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [
            EmailNotification,
          ],
          autoLoadEntities: true,
        }),
        MailModule,
        SubstrateModule,
        EmailNotificationModule,
        ProcessEnvModule,
        EmailEndpointModule,
      ],
    }).compile();

    substrateService = module.get(SubstrateService);
    mailerManager = module.get(MailerManager);

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('POST registered-lab/:lab_id: should return sendMailRegisteredLab', async () => {
    // Act
    const sendLabRegistrationEmailSpy = jest.spyOn(mailerManager, 'sendLabRegistrationEmail');
    sendLabRegistrationEmailSpy.mockImplementation(() => 
      Promise.resolve(true),
    );
    const result = await request(server).post(`/email/registered-lab/${substrateService.pair.address}`).send();

    expect(sendLabRegistrationEmailSpy).toBeCalled();
    expect(result.status).toEqual(200);
    expect(result.body).toEqual(
      expect.objectContaining({
        message: 'Sending Email.',
      })
    );
  });
});