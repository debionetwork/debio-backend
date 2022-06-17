import {
  EmailNotificationService,
  MailerManager,
  SubstrateService,
  ProcessEnvProxy,
} from '../../../../src/common';
import {
  emailNotificationServiceMockFactory,
  mailerManagerMockFactory,
  MockType,
  substrateServiceMockFactory,
} from '../../../../test/unit/mock';
import { EmailEndpointController } from '../../../../src/endpoints/email/email.controller';
import { Response } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import * as labQuery from '@debionetwork/polkadot-provider/lib/query/labs';
import { when } from 'jest-when';

describe('Email Controller', () => {
  let emailEndpointControllerMock: EmailEndpointController;
  let mailerManageMock: MockType<MailerManager>;
  let substrateServiceMock: MockType<SubstrateService>;
  let notificationService: NotificationService; // eslint-disable-line
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
      ],
    }).compile();

    emailEndpointControllerMock = module.get<EmailEndpointController>(
      EmailEndpointController,
    );
    mailerManageMock = module.get(MailerManager);
    substrateServiceMock = module.get(SubstrateService);
    notificationService = module.get(NotificationService); // eslint-disable-line
  });

  it('should be defined', () => {
    expect(emailEndpointControllerMock).toBeDefined();
    expect(mailerManageMock).toBeDefined();
    expect(substrateServiceMock).toBeDefined();
  });

  it('should send email lab registration', async () => {
    //Arrange
    const labId = 'XX';
    const EXPECTED_RESULTS = {
      labId: 'XX',
    };

    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS, // eslint-disable-line
      status: (code: number) => RESPONSE, // eslint-disable-line
    } as Response;
    const queryLab = jest.spyOn(labQuery, 'queryLabById').mockImplementation();

    when(queryLab)
      .calledWith(substrateServiceMock.api, labId)
      .mockReturnValue(EXPECTED_RESULTS);
  });
});
