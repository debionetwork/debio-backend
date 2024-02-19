import { Test, TestingModule } from '@nestjs/testing';
import { mailerServiceMockFactory, MockType } from '../../../mock';
import { MailerService } from '@nestjs-modules/mailer';
import { MailerManager } from '../../../../../src/common';
import { customerStakingRequestService, labRegister } from './mailer.mock.data';

describe('Mailer Manager Unit Tests', () => {
  let mailerManager: MailerManager;
  let mailerServiceMock: MockType<MailerService>;

  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([['POSTGRES_HOST', '']]);
    loadSecrets() {
      return null;
    }

    getSecret(key) {
      return this._secretsList.get(key);
    }
  }

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerManager,
        { provide: MailerService, useFactory: mailerServiceMockFactory },
      ],
    }).compile();

    mailerManager = module.get(MailerManager);
    mailerServiceMock = module.get(MailerService);
  });

  it('should be defined', () => {
    // Assert
    expect(mailerManager).toBeDefined();
  });

  it('should send customer staking request service email', () => {
    // Arrange
    const TO = 'someone';
    const CONTEXT = customerStakingRequestService;

    const EXPECTED_PARAMS = {
      to: TO,
      subject: `New Service Request - ${CONTEXT.service_name} - ${CONTEXT.city}, ${CONTEXT.state}, ${CONTEXT.country}`,
      template: 'customer-staking-request-service',
      context: CONTEXT,
    };

    // Act
    mailerManager.sendCustomerStakingRequestServiceEmail(TO, CONTEXT);

    // Assert
    expect(mailerServiceMock.sendMail).toHaveBeenCalled();
    expect(mailerServiceMock.sendMail).toHaveBeenCalledWith(EXPECTED_PARAMS);
  });

  it('should send lab registration email', () => {
    // Arrange
    const TO = 'someone';
    const CONTEXT = labRegister;

    const EXPECTED_PARAMS = {
      to: TO,
      subject: `New Lab Register – ${CONTEXT.lab_name} - ${CONTEXT.city}, ${CONTEXT.state}, ${CONTEXT.country}`,
      template: 'lab-register',
      context: {
        profile_image: CONTEXT.profile_image,
        email: CONTEXT.email,
        lab_name: CONTEXT.lab_name,
        phone_number: CONTEXT.phone_number,
        country: CONTEXT.country,
        state: CONTEXT.state,
        city: CONTEXT.city,
        address: CONTEXT.address,
        certifications: CONTEXT.certifications,
        services: CONTEXT.services,
      },
      attachments: [
        {
          filename: `Certifications Supporting Document ${labRegister.certifications.length}`,
          path: 'string',
        },
        {
          filename: `Services Supporting Document ${labRegister.services.length}`,
          path: 'string',
        },
      ],
    };

    // Act
    mailerManager.sendLabRegistrationEmail(TO, CONTEXT);

    // Assert
    expect(mailerServiceMock.sendMail).toHaveBeenCalled();
    expect(mailerServiceMock.sendMail).toHaveBeenCalledWith(EXPECTED_PARAMS);
  });
});
