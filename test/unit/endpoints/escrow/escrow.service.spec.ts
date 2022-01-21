import { Test, TestingModule } from '@nestjs/testing';
import { EthereumService, ProcessEnvProxy, SubstrateService } from '../../../../src/common';
import { ethereumServiceMockFactory, MockType, substrateServiceMockFactory } from '../../mock';
import { EscrowService } from '../../../../src/endpoints/escrow/escrow.service';
import { ethers } from 'ethers';

const WALLET_ADDRESS = "ADDR"
jest.mock('ethers', () => ({
  ethers: {
    Wallet: jest.fn(() => {
      return {
        address: WALLET_ADDRESS
      };
    }),
  },
}));

describe('Escrow Service Unit Tests', () => {
  let escrowService: EscrowService;
  let substrateServiceMock: MockType<SubstrateService>;
  let ethereumServiceMock: MockType<EthereumService>;

  const DEBIO_ESCROW_PRIVATE_KEY = "PRIVKEY";
  class ProcessEnvProxyMock {
    env = { DEBIO_ESCROW_PRIVATE_KEY };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EscrowService,
        { provide: SubstrateService, useFactory: substrateServiceMockFactory },
        { provide: EthereumService, useFactory: ethereumServiceMockFactory },
        { provide: ProcessEnvProxy, useClass: ProcessEnvProxyMock },
      ],
    }).compile();

    escrowService = module.get<EscrowService>(EscrowService);
    substrateServiceMock = module.get(SubstrateService);
    ethereumServiceMock = module.get(EthereumService);
  });

  it('should be defined', () => {
    // Assert
    expect(escrowService).toBeDefined();
  });

  it('should refund order', async () => {
    // Arrange
    const ORDER_ID = "ID";
    const ORDER = {
      id: ORDER_ID
    };
    const TOKEN_CONTRACT_SIGNER_MOCK = {
      refundOrder: jest.fn(),
    };
    const SMART_CONTRACT_MOCK = {
      connect: jest.fn(),
    };
    const PROVIDER_MOCK = {
      getBalance: jest.fn(),
    };
    ethereumServiceMock.getEthersProvider.mockReturnValue(PROVIDER_MOCK);
    ethereumServiceMock.getEscrowSmartContract.mockReturnValue(SMART_CONTRACT_MOCK);
    PROVIDER_MOCK.getBalance.mockReturnValue("BALANCE");
    SMART_CONTRACT_MOCK.connect.mockReturnValue(TOKEN_CONTRACT_SIGNER_MOCK);
    const ethersWalletSpy = jest.spyOn(ethers, 'Wallet');

    // Act
    await escrowService.refundOrder(ORDER);

    // Assert
    expect(ethereumServiceMock.getEthersProvider).toHaveBeenCalledTimes(1);
    expect(ethereumServiceMock.getEscrowSmartContract).toHaveBeenCalledTimes(1);
    expect(ethersWalletSpy).toHaveBeenCalledWith(DEBIO_ESCROW_PRIVATE_KEY, PROVIDER_MOCK);
    expect(PROVIDER_MOCK.getBalance).toHaveBeenCalledTimes(1);
    expect(PROVIDER_MOCK.getBalance).toHaveBeenCalledWith(WALLET_ADDRESS);
    expect(SMART_CONTRACT_MOCK.connect).toHaveBeenCalledTimes(1);
    expect(SMART_CONTRACT_MOCK.connect).toHaveBeenCalledWith({
      address: WALLET_ADDRESS
    });
    expect(TOKEN_CONTRACT_SIGNER_MOCK.refundOrder).toHaveBeenCalledTimes(1);
    expect(TOKEN_CONTRACT_SIGNER_MOCK.refundOrder).toHaveBeenCalledWith(ORDER_ID);
  });

  it('should fulfill order', async () => {
    // Arrange
    const ORDER_ID = "ID";
    const CUSTOMER_ID = "ID";
    const ORDER = {
      id: ORDER_ID,
      customerId: CUSTOMER_ID,
    };
    const TOKEN_CONTRACT_SIGNER_MOCK = {
      fulfillOrder: jest.fn(),
    };
    const SMART_CONTRACT_MOCK = {
      connect: jest.fn(),
    };
    const WALLET_MOCK = "WALLET";
    ethereumServiceMock.getEscrowSmartContract.mockReturnValue(SMART_CONTRACT_MOCK);
    ethereumServiceMock.createWallet.mockReturnValue(WALLET_MOCK);
    SMART_CONTRACT_MOCK.connect.mockReturnValue(TOKEN_CONTRACT_SIGNER_MOCK);
    TOKEN_CONTRACT_SIGNER_MOCK.fulfillOrder.mockReturnValue("BALANCE");

    // Act
    await escrowService.orderFulfilled(ORDER);

    // Assert
    expect(ethereumServiceMock.getEscrowSmartContract).toHaveBeenCalledTimes(1);
    expect(ethereumServiceMock.createWallet).toHaveBeenCalledTimes(1);
    expect(ethereumServiceMock.createWallet).toHaveBeenCalledWith(DEBIO_ESCROW_PRIVATE_KEY);
    expect(SMART_CONTRACT_MOCK.connect).toHaveBeenCalledTimes(1);
    expect(SMART_CONTRACT_MOCK.connect).toHaveBeenCalledWith(WALLET_MOCK);
    expect(TOKEN_CONTRACT_SIGNER_MOCK.fulfillOrder).toHaveBeenCalledTimes(1);
    expect(TOKEN_CONTRACT_SIGNER_MOCK.fulfillOrder).toHaveBeenCalledWith(ORDER_ID);
  });
});
