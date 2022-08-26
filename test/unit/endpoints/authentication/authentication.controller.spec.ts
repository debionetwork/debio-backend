import { Test, TestingModule } from '@nestjs/testing';
import { MockType } from '../../mock';
import { Response } from 'express';
import { AuthenticationController } from '../../../../src/endpoints/authentication/authentication.controller';
import { pinataJwtPayload } from '../../../../src/endpoints/authentication/pinata-jwt.model';
import { JwtService } from '@nestjs/jwt';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { keyList } from '../../../../src/common/secrets';

jest.mock('../../../../src/endpoints/authentication/pinata-jwt.model', () => ({
  pinataJwtPayload: jest.fn(),
}));

describe('Authentication Controller Unit Tests', () => {
  let controller: AuthenticationController;
  let gCloudSecretManagerService: GCloudSecretManagerService<keyList>;
  let jwtServiceMock: MockType<JwtService>;

  const jwtServiceMockFactory: () => MockType<JwtService> = jest.fn(() => ({
    signAsync: jest.fn(),
  }));

  const API_KEY = 'DEBIO_API_KEY';
  const PINATA_SECRET_KEY = 'PINATA_SECRET_KEY';
  const PINATA_PRIVATE_KEY = undefined;
  const PINATA_USER_ID = 'PINATA_USER_ID';
  const PINATA_EMAIL = 'PINATA_EMAIL';
  const PINATA_EMAIL_VERIFIED = 'PINATA_EMAIL_VERIFIED';
  const PINATA_PIN_POLICY_REGION_ID = 'PINATA_PIN_POLICY_REGION_ID';
  const PINATA_PIN_POLICY_REGION_REPL_COUNT =
    'PINATA_PIN_POLICY_REGION_REPL_COUNT';
  const PINATA_MFA_ENABLED = 'PINATA_MFA_ENABLED';

  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['DEBIO_API_KEY', API_KEY],
      ['PINATA_SECRET_KEY', PINATA_SECRET_KEY],
      ['PINATA_PRIVATE_KEY', PINATA_PRIVATE_KEY],
      ['PINATA_USER_ID', PINATA_USER_ID],
      ['PINATA_EMAIL', PINATA_EMAIL],
      ['PINATA_EMAIL_VERIFIED', PINATA_EMAIL_VERIFIED],
      ['PINATA_PIN_POLICY_REGION_ID', PINATA_PIN_POLICY_REGION_ID],
      [
        'PINATA_PIN_POLICY_REGION_REPL_COUNT',
        PINATA_PIN_POLICY_REGION_REPL_COUNT,
      ],
      ['PINATA_MFA_ENABLED', PINATA_MFA_ENABLED],
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
      controllers: [AuthenticationController],
      providers: [
        { provide: JwtService, useFactory: jwtServiceMockFactory },
        {
          provide: GCloudSecretManagerService,
          useClass: GoogleSecretManagerServiceMock,
        },
      ],
    }).compile();

    gCloudSecretManagerService = module.get(GCloudSecretManagerService);
    controller = module.get(AuthenticationController);
    jwtServiceMock = module.get(JwtService);
  });

  it('should be defined', () => {
    // Assert
    expect(controller).toBeDefined();
  });

  it('should return jwt', async () => {
    // Arrange
    const MOCK_RESULT = 'JWT';
    const EXPECTED_RESULTS = {
      jwt: MOCK_RESULT,
    };
    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS, // eslint-disable-line
      status: (code: number) => RESPONSE, // eslint-disable-line
    } as Response;

    // Assert
    expect(await controller.PinataJwt(API_KEY, RESPONSE)).toEqual(
      EXPECTED_RESULTS,
    );
    expect(jwtServiceMock.signAsync).toBeCalledTimes(1);
    expect(jwtServiceMock.signAsync).toBeCalledWith(
      pinataJwtPayload(gCloudSecretManagerService),
      {
        secret: PINATA_SECRET_KEY,
        privateKey: PINATA_PRIVATE_KEY,
      },
    );
  });

  it('should return error', async () => {
    // Arrange
    const MOCK_RESULT = 'JWT';
    const EXPECTED_RESULTS = {
      jwt: MOCK_RESULT,
    };
    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS, // eslint-disable-line
      status: (code: number) => RESPONSE, // eslint-disable-line
    } as Response;

    // Assert
    expect(await controller.PinataJwt('API_KEY', RESPONSE)).toEqual(
      EXPECTED_RESULTS,
    );
    expect(jwtServiceMock.signAsync).toBeCalledTimes(0);
  });
});
