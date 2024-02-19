import { Test, TestingModule } from '@nestjs/testing';
import { MockType } from '../../mock';
import { VerificationService } from '../../../../src/endpoints/verification/verification.service';
import { VerificationController } from '../../../../src/endpoints/verification/verification.controller';
import httpMocks = require('node-mocks-http');
import { config } from '../../../../src/config';

describe('Verification Controller Unit Tests', () => {
  let verificationController: VerificationController;

  const verificationServiceMockFactory: () => MockType<VerificationService> =
    jest.fn(() => ({
      verificationLab: jest.fn((entity) => entity),
      verificationGeneticAnalyst: jest.fn((entity) => entity),
    }));
  let verificationServiceMock: MockType<VerificationService>;

  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['DEBIO_API_KEY', 'DEBIO_API_KEY'],
    ]);
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
        VerificationController,
        {
          provide: VerificationService,
          useFactory: verificationServiceMockFactory,
        },
      ],
    }).compile();

    verificationServiceMock = module.get(VerificationService);
    verificationController = module.get(VerificationController);
  });

  it('should be defined', () => {
    // Assert
    expect(verificationController).toBeDefined();
  });

  it('should return response 401 lab', async () => {
    // Arrange
    const EXPECTED_STATUS = 401;
    const EXPECTED_RESULT = 'debio-api-key header is required';
    const API_KEY = 'ASD';
    const ACCOUNT_ID = 'ACCOUT_ID';
    const VERIFICATION_STATUS = 'VERIFICATION_STATUS';

    // Act
    const response = await verificationController.updateStatusLab(
      API_KEY,
      httpMocks.createResponse(),
      ACCOUNT_ID,
      VERIFICATION_STATUS,
    );

    // Assert
    expect(response.statusCode).toEqual(EXPECTED_STATUS);
    response.on('data', function (data) {
      expect(data).toEqual(EXPECTED_RESULT);
    });
  });

  it('should return response 500 lab', async () => {
    // Arrange
    const EXPECTED_STATUS = 500;
    const EXPECTED_RESULT = "I just don't feel like it";
    const API_KEY = config.DEBIO_API_KEY;
    const ACCOUNT_ID = 'ACCOUT_ID';
    const VERIFICATION_STATUS = 'VERIFICATION_STATUS';
    verificationServiceMock.verificationLab.mockImplementation(() =>
      Promise.reject(EXPECTED_RESULT),
    );

    // Act
    const response = await verificationController.updateStatusLab(
      API_KEY,
      httpMocks.createResponse(),
      ACCOUNT_ID,
      VERIFICATION_STATUS,
    );

    // Assert
    expect(response.statusCode).toEqual(EXPECTED_STATUS);
    response.on('data', function (data) {
      expect(data).toEqual(EXPECTED_RESULT);
    });
  });

  it('should return response 500 genetic analyst', async () => {
    // Arrange
    const EXPECTED_STATUS = 500;
    const EXPECTED_RESULT = "I just don't feel like it";
    const API_KEY = config.DEBIO_API_KEY;
    const ACCOUNT_ID = 'ACCOUT_ID';
    const VERIFICATION_STATUS = 'VERIFICATION_STATUS';
    verificationServiceMock.verificationGeneticAnalyst.mockImplementation(() =>
      Promise.reject(EXPECTED_RESULT),
    );

    // Act
    const response = await verificationController.updateStatusGeneticAnalyst(
      API_KEY,
      httpMocks.createResponse(),
      ACCOUNT_ID,
      VERIFICATION_STATUS,
    );

    // Assert
    expect(response.statusCode).toEqual(EXPECTED_STATUS);
    response.on('data', function (data) {
      expect(data).toEqual(EXPECTED_RESULT);
    });
  });

  it('should return response 200 lab', async () => {
    // Arrange
    const EXPECTED_STATUS = 200;
    const EXPECTED_RESULT = 'Verified, and Got Reward 2 DBIO';
    const API_KEY = config.DEBIO_API_KEY;
    const ACCOUNT_ID = 'ACCOUT_ID';
    const VERIFICATION_STATUS = 'Verified';

    // Act
    const response = await verificationController.updateStatusLab(
      API_KEY,
      httpMocks.createResponse(),
      ACCOUNT_ID,
      VERIFICATION_STATUS,
    );

    // Assert
    expect(response.statusCode).toEqual(EXPECTED_STATUS);
    response.on('data', function (data) {
      expect(data).toEqual(EXPECTED_RESULT);
    });
  });

  it('should return response 200 genetic analyst', async () => {
    // Arrange
    const EXPECTED_STATUS = 200;
    const EXPECTED_RESULT = 'Verified';
    const API_KEY = config.DEBIO_API_KEY;
    const ACCOUNT_ID = 'ACCOUT_ID';
    const VERIFICATION_STATUS = 'Verified';

    // Act
    const response = await verificationController.updateStatusGeneticAnalyst(
      API_KEY,
      httpMocks.createResponse(),
      ACCOUNT_ID,
      VERIFICATION_STATUS,
    );

    // Assert
    expect(response.statusCode).toEqual(EXPECTED_STATUS);
    response.on('data', function (data) {
      expect(data).toEqual(EXPECTED_RESULT);
    });
  });
});
