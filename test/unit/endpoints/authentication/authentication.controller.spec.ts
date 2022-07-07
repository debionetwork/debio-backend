import { Test, TestingModule } from '@nestjs/testing';
import { MockType } from '../../mock';
import { ProcessEnvProxy } from '../../../../src/common';
import { Response } from 'express';
import { AuthenticationController } from '../../../../src/endpoints/authentication/authentication.controller';
import { pinataJwtPayload } from '../../../../src/endpoints/authentication/pinata-jwt.model';
import { JwtService } from '@nestjs/jwt';

jest.mock('../../../../src/endpoints/authentication/pinata-jwt.model', () => ({
  pinataJwtPayload: {},
}));

describe('Authentication Controller Unit Tests', () => {
  let controller: AuthenticationController;
  let jwtServiceMock: MockType<JwtService>;

  const jwtServiceMockFactory: () => MockType<JwtService> = jest.fn(() => ({
    signAsync: jest.fn(),
  }));

  const API_KEY = 'DEBIO_API_KEY';
  const PINATA_SECRET_KEY = 'PINATA_SECRET_KEY';
  const PINATA_PRIVATE_KEY = 'PINATA_PRIVATE_KEY';
  class ProcessEnvProxyMock {
    env = {
      DEBIO_API_KEY: API_KEY,
      PINATA_SECRET_KEY: PINATA_SECRET_KEY,
      PINATA_PRIVATE_KEY: PINATA_PRIVATE_KEY,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: ProcessEnvProxy,
          useClass: ProcessEnvProxyMock,
        },
        { provide: JwtService, useFactory: jwtServiceMockFactory },
      ],
    }).compile();

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
    expect(jwtServiceMock.signAsync).toBeCalledWith(pinataJwtPayload, {
      secret: PINATA_SECRET_KEY,
      privateKey: PINATA_PRIVATE_KEY,
    });
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
