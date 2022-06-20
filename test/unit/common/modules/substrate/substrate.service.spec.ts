import { Test, TestingModule } from '@nestjs/testing';
import { mockFunction } from '../../../mock';
import {
  GoogleSecretManagerService,
  SubstrateService,
} from '../../../../../src/common';
import { ApiPromise, Keyring } from '@polkadot/api';

jest.mock('../../../mock', () => ({
  mockFunction: jest.fn(),
}));

const apiPromiseSpy = jest.spyOn(ApiPromise, 'create');
const keyringSpy = jest.spyOn(Keyring.prototype, 'addFromUri');

describe.only('Substrate Service Unit Test', () => {
  let substrateService: SubstrateService;

  const SUBSTRATE_URL = 'URL';
  const ADMIN_SUBSTRATE_MNEMONIC = 'ADDR';
  class GoogleSecretManagerServiceMock {
    substrateUrl = SUBSTRATE_URL;
    adminSubstrateMnemonic = ADMIN_SUBSTRATE_MNEMONIC;
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubstrateService,
        {
          provide: GoogleSecretManagerService,
          useClass: GoogleSecretManagerServiceMock,
        },
      ],
    }).compile();

    substrateService = module.get(SubstrateService);
  });

  it('should be defined', () => {
    // Assert
    expect(substrateService).toBeDefined();
  });

  it('should initialize module and listener', async () => {
    // Reset Everything
    await substrateService.stopListen();
    (mockFunction as jest.Mock).mockClear();
    apiPromiseSpy.mockClear();
    keyringSpy.mockClear();

    // Act
    await substrateService.onModuleInit();

    // Assert
    expect(mockFunction).toHaveBeenCalledTimes(5);
    expect(mockFunction).toHaveBeenCalledWith(SUBSTRATE_URL);
    expect(mockFunction).toHaveBeenCalledWith({ type: 'sr25519' });
    expect(mockFunction).toHaveBeenCalledWith('connected');
    expect(mockFunction).toHaveBeenCalledWith('disconnected');
    expect(mockFunction).toHaveBeenCalledWith('error');
    expect(keyringSpy).toHaveBeenCalledTimes(1);
    expect(keyringSpy).toHaveBeenCalledWith(ADMIN_SUBSTRATE_MNEMONIC);
    expect(apiPromiseSpy).toHaveBeenCalledTimes(1);
  });

  it('should initialize listener', async () => {
    // Reset Everything
    await substrateService.stopListen();
    (mockFunction as jest.Mock).mockClear();
    apiPromiseSpy.mockClear();

    // Act
    await substrateService.startListen();

    // Assert
    expect(apiPromiseSpy).toHaveBeenCalledTimes(1);
    expect(mockFunction).toHaveBeenCalledTimes(3);
    expect(mockFunction).toHaveBeenCalledWith('connected');
    expect(mockFunction).toHaveBeenCalledWith('disconnected');
    expect(mockFunction).toHaveBeenCalledWith('error');
  });

  it('should stop listener and start again', async () => {
    // Reset Everything
    await substrateService.stopListen();
    (mockFunction as jest.Mock).mockClear();
    apiPromiseSpy.mockClear();

    // Act
    await substrateService.startListen();
    await substrateService.stopListen();
    await substrateService.startListen();

    // Assert
    expect(apiPromiseSpy).toHaveBeenCalledTimes(2);
    expect(mockFunction).toHaveBeenCalledTimes(6);
    expect(mockFunction).toHaveBeenCalledWith('connected');
    expect(mockFunction).toHaveBeenCalledWith('disconnected');
    expect(mockFunction).toHaveBeenCalledWith('error');
  });
});
