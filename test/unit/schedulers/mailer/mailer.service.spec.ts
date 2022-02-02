import { Test, TestingModule } from '@nestjs/testing';
import { MockType, MockLogger, mailerManagerMockFactory, emailNotificationServiceMockFactory, substrateServiceMockFactory } from '../../mock';
import { MailerService } from '../../../../src/schedulers/mailer/mailer.service';
import { EmailNotificationService, MailerManager, SubstrateService } from '../../../../src/common';
import * as emailNotificationQuery from '../../../../src/common/modules/database/';
import { async } from 'rxjs';


describe('MailerService', () => {
  let service: MailerService;
  let mailManagerMock: MockType<MailerManager>;
  let emailNotificationServiceMock: MockType<EmailNotificationService>;
  let substrateServiceMock: MockType<SubstrateService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        {
          provide: MailerManager,
          useFactory: mailerManagerMockFactory,
        },
        {
          provide: EmailNotificationService,
          useFactory: emailNotificationServiceMockFactory,
        },
        {
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory,
        },
      ],
    }).compile();
    module.useLogger(MockLogger);

    mailManagerMock = module.get(MailerManager);
    emailNotificationServiceMock = module.get(EmailNotificationService);
    substrateServiceMock = module.get(SubstrateService);
  });

  it('should be defined', () => {
    expect(mailManagerMock).toBeDefined();
  });

  it('should not do anything', async () => {
   const labRegisterPending = await emailNotificationServiceMock.getPendingLabRegisterNotification();
   expect(labRegisterPending).toEqual(undefined);
  })


  
});
