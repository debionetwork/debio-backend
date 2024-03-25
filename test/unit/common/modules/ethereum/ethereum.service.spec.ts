import { Test, TestingModule } from '@nestjs/testing';
import { CachesService, EthereumService } from '../../../../../src/common';
import { cachesServiceMockFactory, MockType } from '../../../mock';
import { EthersContract, EthersSigner } from 'nestjs-ethers';
import ABI from '../../../../../src/common/modules/ethereum/utils/ABI.json';
import escrowContract from '../../../../../src/common/modules/ethereum/utils/Escrow.json';
import { ethers } from 'ethers';
import { config } from '../../../../../src/config';

const PROVIDER_RESULT = 1;
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      JsonRpcProvider: jest.fn((rpc) => {
        return {
          rpc: rpc,
          provider: PROVIDER_RESULT,
        };
      }),
    },
    Contract: jest.fn(() => {
      return {
        provider: PROVIDER_RESULT,
      };
    }),
  },
}));

describe.only('EthereumService', () => {
  let ethereumService: EthereumService;
  let cachesServiceMock: MockType<CachesService>;
  let ethersContractMock: MockType<EthersContract>;
  let ethersSignerMock: MockType<EthersSigner>;

  const ethersContractMockFactory: () => MockType<EthersContract> = jest.fn(
    () => ({
      create: jest.fn(),
    }),
  );

  const ethersSignerMockFactory: () => MockType<EthersSigner> = jest.fn(() => ({
    createWallet: jest.fn(),
  }));

  const WEB3_RPC_HTTPS = config.WEB3_RPC_HTTPS;
  const ESCROW_CONTRACT_ADDRESS = config.ESCROW_CONTRACT_ADDRESS;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EthereumService,
        { provide: CachesService, useFactory: cachesServiceMockFactory },
        { provide: EthersContract, useFactory: ethersContractMockFactory },
        { provide: EthersSigner, useFactory: ethersSignerMockFactory },
      ],
    }).compile();

    ethereumService = module.get(EthereumService);
    cachesServiceMock = module.get(CachesService);
    ethersContractMock = module.get(EthersContract);
    ethersSignerMock = module.get(EthersSigner);
  });

  it('should be defined', () => {
    // Assert
    expect(ethereumService).toBeDefined();
  });

  it('should call getLastBlock method with expected params', async () => {
    // Act
    ethereumService.getLastBlock();

    // Assert
    expect(cachesServiceMock.getLastBlock).toHaveBeenCalled();
  });

  it('should call setLastBlock method with expected params', async () => {
    // Arrange
    const BLOCK_NUM = 0;

    // Act
    ethereumService.setLastBlock(BLOCK_NUM);

    // Assert
    expect(cachesServiceMock.setLastBlock).toHaveBeenCalledWith(BLOCK_NUM);
  });

  it('should call create wallet', async () => {
    // Arrange
    const EXPECTED_RESULT = 1;
    const PRIVKEY = 'KEY';
    ethersSignerMock.createWallet.mockReturnValue(EXPECTED_RESULT);

    // Act
    const RESULT = await ethereumService.createWallet(PRIVKEY);

    // Assert
    expect(RESULT).toEqual(EXPECTED_RESULT);
    expect(ethersSignerMock.createWallet).toHaveBeenCalled();
    expect(ethersSignerMock.createWallet).toHaveBeenCalledWith(PRIVKEY);
  });

  it('should get contract', () => {
    // Arrange
    const RESULT = 1;
    ethersContractMock.create.mockReturnValue(RESULT);

    // Assert
    expect(ethereumService.getContract()).toEqual(RESULT);
    expect(ethersContractMock.create).toHaveBeenCalled();
    expect(ethersContractMock.create).toHaveBeenCalledWith(
      ESCROW_CONTRACT_ADDRESS,
      ABI,
    );
  });

  it('should get provider', () => {
    // Arrange
    const jsonRpcSpy = jest.spyOn(ethers.providers, 'JsonRpcProvider');

    // Assert
    expect(ethereumService.getEthersProvider()).toEqual({
      rpc: WEB3_RPC_HTTPS,
      provider: PROVIDER_RESULT,
    });
    expect(jsonRpcSpy).toHaveBeenCalled();
    expect(jsonRpcSpy).toHaveBeenCalledWith(WEB3_RPC_HTTPS);
  });

  it('should get escrow smart contract', () => {
    // Arrange
    const ethServiceSpy = jest.spyOn(ethereumService, 'getEthersProvider');
    const jsonRpcSpy = jest.spyOn(ethers.providers, 'JsonRpcProvider');
    const contractSpy = jest.spyOn(ethers, 'Contract');

    // Assert
    expect(ethereumService.getEscrowSmartContract()).toEqual({
      provider: PROVIDER_RESULT,
    });
    expect(ethServiceSpy).toHaveBeenCalled();
    expect(jsonRpcSpy).toHaveBeenCalled();
    expect(jsonRpcSpy).toHaveBeenCalledWith(WEB3_RPC_HTTPS);
    expect(contractSpy).toHaveBeenCalled();
    expect(contractSpy).toHaveBeenCalledWith(
      ESCROW_CONTRACT_ADDRESS,
      escrowContract.abi,
      ethereumService.getEthersProvider(),
    );
  });
});
