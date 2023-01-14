import {
  EmailNotificationService,
  MailerManager,
  SubstrateService,
  ProcessEnvProxy,
} from '../../../../src/common';
import {
  emailNotificationServiceMockFactory,
  emailSenderServiceMockFactory,
  googleSecretManagerServiceMockFactory,
  mailerManagerMockFactory,
  MockType,
  substrateServiceMockFactory,
} from '../../../../test/unit/mock';
import { EmailEndpointController } from '../../../../src/endpoints/email/email.controller';
import { Response } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import * as labQuery from '@debionetwork/polkadot-provider/lib/query/labs';
import * as mailerLab from '../../../../src/common/modules/mailer/models/lab-register.model/index';
import * as mailerGA from '../../../../src/common/modules/mailer/models/genetic-analyst-register.model/index';
import { when } from 'jest-when';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { EmailSenderService } from '../../../../src/common/modules/email-sender/email-sender.service';

describe('Email Controller', () => {
  let emailEndpointControllerMock: EmailEndpointController;
  let mailerManageMock: MockType<MailerManager>;
  let substrateServiceMock: MockType<SubstrateService>;
  let emailSenderServiceMock: MockType<EmailSenderService>;
  const EMAILS = 'email';

  class ProcessEnvProxyMock {
    env = { EMAILS };
  }

  //Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailEndpointController,
        {
          provide: ProcessEnvProxy,
          useClass: ProcessEnvProxyMock,
        },
        {
          provide: MailerManager,
          useFactory: mailerManagerMockFactory,
        },
        {
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory,
        },
        {
          provide: EmailNotificationService,
          useFactory: emailNotificationServiceMockFactory,
        },
        {
          provide: GCloudSecretManagerService,
          useFactory: googleSecretManagerServiceMockFactory,
        },
        {
          provide: EmailSenderService,
          useFactory: emailSenderServiceMockFactory,
        }
      ],
    }).compile();

    emailEndpointControllerMock = module.get<EmailEndpointController>(
      EmailEndpointController,
    );
    mailerManageMock = module.get(MailerManager);
    substrateServiceMock = module.get(SubstrateService);
    emailSenderServiceMock = module.get(EmailSenderService);
  });

  it('should be defined', () => {
    expect(emailEndpointControllerMock).toBeDefined();
    expect(mailerManageMock).toBeDefined();
    expect(substrateServiceMock).toBeDefined();
    expect(emailSenderServiceMock).toBeDefined();
  });

  it('should send email lab registration', async () => {
    //Arrange
    const labId = 'XX';
    const EXPECTED_RESULTS = {
      labId: 'XX',
    };
    const EXPECTED_RESULTS_REGISTER = {
      lab_id: 'XX',
      email: 'XX',
      phone_number: 'XX',
      website: 'XX',
      lab_name: 'XX',
      country: 'XX',
      state: 'XX',
      city: 'XX',
      profile_image: 'XX',
      address: 'XX',
      certifications: [],
      services: [],
    };

    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS, // eslint-disable-line
      status: (code: number) => RESPONSE, // eslint-disable-line
    } as Response;
    const queryLab = jest.spyOn(labQuery, 'queryLabById').mockImplementation();
    const labToLabRegister = jest.spyOn(mailerLab, 'labToLabRegister').mockImplementation();;

    when(queryLab)
      .calledWith(substrateServiceMock.api, labId)
      .mockReturnValue(EXPECTED_RESULTS);
    when(labToLabRegister)
      .calledWith(substrateServiceMock.api, EXPECTED_RESULTS)
      .mockReturnValue(EXPECTED_RESULTS_REGISTER);
    
    await emailEndpointControllerMock.sendMailRegisteredLab(labId);
    expect(emailSenderServiceMock.sendToLab).toHaveBeenCalled();
    expect(emailSenderServiceMock.sendToLab).toBeCalledWith(EXPECTED_RESULTS_REGISTER);
  });
});
