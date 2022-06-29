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
} from '../../../src/common';
import { MailerService } from '../../../src/schedulers/mailer/mailer.service';
import { Keyring } from '@polkadot/api';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dummyCredentials } from '../config';
import { SubstrateService } from '../../../src/common/modules/substrate/substrate.service';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';

describe('Mailer Scheduler (e2e)', () => {
  let service: MailerService;
  let mailerManager: MailerManager;
  let substrateService: SubstrateService;
  let emailNotificationService: EmailNotificationService;
  let gCloudSecretManagerService: GCloudSecretManagerService;

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
    _secretsList = new Map<string, string>([
      ['ELASTICSEARCH_NODE', process.env.ELASTICSEARCH_NODE],
      ['ELASTICSEARCH_USERNAME', process.env.ELASTICSEARCH_USERNAME],
      ['ELASTICSEARCH_PASSWORD', process.env.ELASTICSEARCH_PASSWORD],
      ['ADMIN_SUBSTRATE_MNEMONIC', process.env.ADMIN_SUBSTRATE_MNEMONIC],
      ['SUBSTRATE_URL', process.env.SUBSTRATE_URL],
      ['EMAIL', process.env.EMAIL],
      ['PASS_EMAIL', process.env.PASS_EMAIL],
      ['UNSTAKE_TIMER', process.env.UNSTAKE_TIMER],
      ['UNSTAKE_INTERVAL', process.env.UNSTAKE_INTERVAL],
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
        GCloudSecretManagerModule,
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
      .overrideProvider(GCloudSecretManagerService)
      .useClass(GoogleSecretManagerServiceMock)
      .compile();

    mailerManager = module.get(MailerManager);
    substrateService = module.get(SubstrateService);
    emailNotificationService = module.get(EmailNotificationService);
    gCloudSecretManagerService = module.get(GCloudSecretManagerService);
    service = new MailerService(
      gCloudSecretManagerService,
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
