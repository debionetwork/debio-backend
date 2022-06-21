import 'regenerator-runtime/runtime';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import {
  EmailNotification,
  EmailNotificationModule,
  EmailNotificationService,
} from '../../../src/common/modules/database';
import {
  SubstrateModule,
  MailModule,
  MailerManager,
  GoogleSecretManagerService,
  GoogleSecretManagerModule,
} from '../../../src/common';
import { MailerService } from '../../../src/schedulers/mailer/mailer.service';
import { Keyring } from '@polkadot/api';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dummyCredentials } from '../config';
import { SubstrateService } from '../../../src/common/modules/substrate/substrate.service';

describe('Mailer Scheduler (e2e)', () => {
  let service: MailerService;
  let mailerManager: MailerManager;
  let substrateService: SubstrateService;
  let emailNotificationService: EmailNotificationService;
  let googleSecretManagerService: GoogleSecretManagerService;

  let app: INestApplication;

  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  class GoogleSecretManagerServiceMock {
    async accessSecret() {
      return null;
    }
    elasticsearchNode = process.env.ELASTICSEARCH_NODE;
    elasticsearchUsername = process.env.ELASTICSEARCH_USERNAME;
    elasticsearchPassword = process.env.ELASTICSEARCH_PASSWORD;
    adminSubstrateMnemonic = process.env.ADMIN_SUBSTRATE_MNEMONIC;
    substrateUrl = process.env.SUBSTRATE_URL;
    email = process.env.EMAIL;
    passEmail = process.env.PASS_EMAIL;
    emails = process.env.EMAILS;
    unstakeTimer = process.env.UNSTAKE_TIMER;
    unstakeInterval = process.env.UNSTAKE_INTERVAL;
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        GoogleSecretManagerModule,
        TypeOrmModule.forRoot({
          name: 'default',
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [EmailNotification],
          autoLoadEntities: true,
        }),
        SubstrateModule,
        MailModule,
        EmailNotificationModule,
      ],
    })
      .overrideProvider(GoogleSecretManagerService)
      .useClass(GoogleSecretManagerServiceMock)
      .compile();

    mailerManager = module.get(MailerManager);
    substrateService = module.get(SubstrateService);
    emailNotificationService = module.get(EmailNotificationService);
    googleSecretManagerService = module.get(GoogleSecretManagerService);
    service = new MailerService(
      googleSecretManagerService,
      mailerManager,
      emailNotificationService,
      substrateService,
    );

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await substrateService.stopListen();
    substrateService.destroy();
  });

  it('handlePendingLabRegister should not throw', async () => {
    // Arrange
    const sendLabRegistrationEmailSpy = jest.spyOn(
      mailerManager,
      'sendLabRegistrationEmail',
    );
    const setEmailNotificationSentSpy = jest.spyOn(
      emailNotificationService,
      'setEmailNotificationSent',
    );
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = await keyring.addFromUri('//Alice', { name: 'Alice default' });

    // Act
    await service.handlePendingLabRegister();

    await substrateService.stopListen();

    // Assert
    expect(sendLabRegistrationEmailSpy).toBeCalledTimes(1);
    expect(setEmailNotificationSentSpy).toBeCalledTimes(1);
    expect(setEmailNotificationSentSpy).toBeCalledWith(pair.address);
  }, 25000);
});
