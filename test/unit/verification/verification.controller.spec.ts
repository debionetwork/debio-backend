import { Test, TestingModule } from '@nestjs/testing';
import { MockType } from '../mock';
import { VerificationService } from '../../../src/verification/verification.service';
import { VerificationController } from '../../../src/verification/verification.controller';
import { ProcessEnvProxy } from '../../../src/common/process-env';
import httpMocks = require('node-mocks-http');

describe('Verification Controller Unit Tests', () => {
  let verificationController: VerificationController;
  
  const verificationServiceMockFactory: () => MockType<VerificationService> = jest.fn(() => ({
    vericationLab: jest.fn(entity => entity),
  }));
  let verificationServiceMock: MockType<VerificationService>;

  class ProcessEnvProxyMock {
    env = {
        DEBIO_API_KEY: "DEBIO_API_KEY"
    };
  }
  let processEnvProxyMock: ProcessEnvProxyMock;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationController,
        {
            provide: ProcessEnvProxy,
            useClass: ProcessEnvProxyMock
        },
        {
            provide: VerificationService,
            useFactory: verificationServiceMockFactory
        }
      ],
    }).compile();
  
    processEnvProxyMock = module.get(ProcessEnvProxy);
    verificationServiceMock = module.get(VerificationService);
    verificationController = module.get(VerificationController);
  });

  it('should be defined', () => {
    // Assert
    expect(verificationController).toBeDefined();
  });

  it("should return response 401", async () => {
    // Arrange
    const EXPECTED_STATUS = 401;
    const EXPECTED_RESULT = "debio-api-key header is required";
    const API_KEY = "ASD";
    const ACCOUNT_ID = "ACCOUT_ID";
    const VERIFICATION_STATUS = "VERIFICATION_STATUS";

    // Act
    const response = await verificationController.updateStatusLab(
        API_KEY,
        httpMocks.createResponse(),
        ACCOUNT_ID,
        VERIFICATION_STATUS
    );

    // Assert
    expect(response.statusCode).toEqual(EXPECTED_STATUS);
    response.on("data", function (data) {
        expect(data).toEqual(EXPECTED_RESULT);
    });
  });

  it("should return response 500", async () => {
    // Arrange
    const EXPECTED_STATUS = 500;
    const EXPECTED_RESULT = "I just don't feel like it";
    const API_KEY = "DEBIO_API_KEY";
    const ACCOUNT_ID = "ACCOUT_ID";
    const VERIFICATION_STATUS = "VERIFICATION_STATUS";
    verificationServiceMock.vericationLab.mockImplementation(() => Promise.reject(EXPECTED_RESULT));

    // Act
    const response = await verificationController.updateStatusLab(
        API_KEY,
        httpMocks.createResponse(),
        ACCOUNT_ID,
        VERIFICATION_STATUS
    );

    // Assert
    expect(response.statusCode).toEqual(EXPECTED_STATUS);
    response.on("data", function (data) {
        expect(data).toEqual(EXPECTED_RESULT);
    });
  });

  it("should return response 200", async () => {
    // Arrange
    const EXPECTED_STATUS = 200;
    const EXPECTED_RESULT = "Verified, and Got Reward 2 DBIO";
    const API_KEY = "DEBIO_API_KEY";
    const ACCOUNT_ID = "ACCOUT_ID";
    const VERIFICATION_STATUS = "Verified";

    // Act
    const response = await verificationController.updateStatusLab(
        API_KEY,
        httpMocks.createResponse(),
        ACCOUNT_ID,
        VERIFICATION_STATUS
    );

    // Assert
    expect(response.statusCode).toEqual(EXPECTED_STATUS);
    response.on("data", function (data) {
        expect(data).toEqual(EXPECTED_RESULT);
    });
  });
});
