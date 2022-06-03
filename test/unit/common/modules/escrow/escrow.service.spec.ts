import { Test, TestingModule } from '@nestjs/testing';
import {
  EthereumService,
  ProcessEnvProxy,
  SubstrateService,
} from '../../../../../src/common';
import {
  ethereumServiceMockFactory,
  MockType,
  substrateServiceMockFactory,
} from '../../../mock';
import { EscrowService } from '../../../../../src/common/modules/escrow/escrow.service';
import { ethers } from 'ethers';
import { setOrderPaid } from '@debionetwork/polkadot-provider';

jest.mock('@debionetwork/polkadot-provider', () => ({
  setOrderPaid: jest.fn(),
}));

const WALLET_ADDRESS = 'ADDR';
const ETHERS_PARSE_UNITS_MOCK = {
  tokenAmount: 'AMOUNT',
};
const ETHERS_WALLET_MOCK = {
  address: WALLET_ADDRESS,
};
jest.mock('ethers', () => ({
  ethers: {
    utils: {
      parseUnits: jest.fn(() => {
        return ETHERS_PARSE_UNITS_MOCK;
      }),
    },
    Wallet: jest.fn(() => {
      return ETHERS_WALLET_MOCK;
    }),
  },
}));

describe('Escrow Service Unit Tests', () => {
  let escrowService: EscrowService;
  let substrateServiceMock: MockType<SubstrateService>;
  let ethereumServiceMock: MockType<EthereumService>;

  const DEBIO_ESCROW_PRIVATE_KEY = 'PRIVKEY';
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
    const ORDER_ID = 'ID';
    const ORDER = {
      id: ORDER_ID,
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
    ethereumServiceMock.getEscrowSmartContract.mockReturnValue(
      SMART_CONTRACT_MOCK,
    );
    PROVIDER_MOCK.getBalance.mockReturnValue('BALANCE');
    SMART_CONTRACT_MOCK.connect.mockReturnValue(TOKEN_CONTRACT_SIGNER_MOCK);
    const ethersWalletSpy = jest.spyOn(ethers, 'Wallet');

    // Act
    await escrowService.refundOrder(ORDER);

    // Assert
    expect(ethereumServiceMock.getEthersProvider).toHaveBeenCalledTimes(1);
    expect(ethereumServiceMock.getEscrowSmartContract).toHaveBeenCalledTimes(1);
    expect(ethersWalletSpy).toHaveBeenCalledWith(
      DEBIO_ESCROW_PRIVATE_KEY,
      PROVIDER_MOCK,
    );
    expect(PROVIDER_MOCK.getBalance).toHaveBeenCalledTimes(1);
    expect(PROVIDER_MOCK.getBalance).toHaveBeenCalledWith(WALLET_ADDRESS);
    expect(SMART_CONTRACT_MOCK.connect).toHaveBeenCalledTimes(1);
    expect(SMART_CONTRACT_MOCK.connect).toHaveBeenCalledWith({
      address: WALLET_ADDRESS,
    });
    expect(TOKEN_CONTRACT_SIGNER_MOCK.refundOrder).toHaveBeenCalledTimes(1);
    expect(TOKEN_CONTRACT_SIGNER_MOCK.refundOrder).toHaveBeenCalledWith(
      ORDER_ID,
    );
  });

  it('should fulfill order', async () => {
    // Arrange
    const ORDER_ID = 'ID';
    const CUSTOMER_ID = 'ID';
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
    const WALLET_MOCK = 'WALLET';
    ethereumServiceMock.getEscrowSmartContract.mockReturnValue(
      SMART_CONTRACT_MOCK,
    );
    ethereumServiceMock.createWallet.mockReturnValue(WALLET_MOCK);
    SMART_CONTRACT_MOCK.connect.mockReturnValue(TOKEN_CONTRACT_SIGNER_MOCK);
    TOKEN_CONTRACT_SIGNER_MOCK.fulfillOrder.mockReturnValue('BALANCE');

    // Act
    await escrowService.orderFulfilled(ORDER);

    // Assert
    expect(ethereumServiceMock.getEscrowSmartContract).not.toBeCalled();
    expect(ethereumServiceMock.createWallet).not.toBeCalled();
    // expect(ethereumServiceMock.createWallet).toHaveBeenCalledWith(
    //   DEBIO_ESCROW_PRIVATE_KEY,
    // );
    // expect(SMART_CONTRACT_MOCK.connect).toHaveBeenCalledTimes(1);
    // expect(SMART_CONTRACT_MOCK.connect).toHaveBeenCalledWith(WALLET_MOCK);
    // expect(TOKEN_CONTRACT_SIGNER_MOCK.fulfillOrder).toHaveBeenCalledTimes(1);
    // expect(TOKEN_CONTRACT_SIGNER_MOCK.fulfillOrder).toHaveBeenCalledWith(
    //   ORDER_ID,
    // );
  });

  it('should set order paid with substrate', async () => {
    // Arrange
    const ORDER_ID = 'ID';
    const API = 'API';
    const PAIR = 'PAIR';
    Reflect.set(substrateServiceMock, 'api', API);
    Reflect.set(substrateServiceMock, 'pair', PAIR);

    // Act
    await escrowService.setOrderPaidWithSubstrate(ORDER_ID);

    // Assert
    expect(setOrderPaid).toHaveBeenCalledTimes(1);
    expect(setOrderPaid).toHaveBeenCalledWith(API, PAIR, ORDER_ID);
  });

  it('should forward payment to seller', async () => {
    // Arrange
    const SELLER_ADDRESS = 'ADDR';
    const AMOUNT = 1;
    const TOKEN_CONTRACT_SIGNER_MOCK = {
      transferFrom: jest.fn(),
    };
    const SMART_CONTRACT_MOCK = {
      connect: jest.fn(),
    };
    ethereumServiceMock.getContract.mockReturnValue(SMART_CONTRACT_MOCK);
    ethereumServiceMock.createWallet.mockReturnValue(ETHERS_WALLET_MOCK);
    SMART_CONTRACT_MOCK.connect.mockReturnValue(TOKEN_CONTRACT_SIGNER_MOCK);
    TOKEN_CONTRACT_SIGNER_MOCK.transferFrom.mockReturnValue('BALANCE');
    const ethParseUnitsSpy = jest.spyOn(ethers.utils, 'parseUnits');
    const OPTIONS = {
      gasLimit: 60000,
      gasPrice: ETHERS_PARSE_UNITS_MOCK,
    };

    // Act
    await escrowService.forwardPaymentToSeller(SELLER_ADDRESS, AMOUNT);

    // Assert
    expect(ethParseUnitsSpy).toHaveBeenCalledTimes(2);
    expect(ethParseUnitsSpy).toHaveBeenCalledWith(String(AMOUNT), 18);
    expect(ethParseUnitsSpy).toHaveBeenCalledWith('100', 'gwei');
    expect(ethereumServiceMock.getContract).toHaveBeenCalledTimes(1);
    expect(ethereumServiceMock.createWallet).toHaveBeenCalledTimes(1);
    expect(ethereumServiceMock.createWallet).toHaveBeenCalledWith(
      DEBIO_ESCROW_PRIVATE_KEY,
    );
    expect(SMART_CONTRACT_MOCK.connect).toHaveBeenCalledTimes(1);
    expect(SMART_CONTRACT_MOCK.connect).toHaveBeenCalledWith(
      ETHERS_WALLET_MOCK,
    );
    expect(TOKEN_CONTRACT_SIGNER_MOCK.transferFrom).toHaveBeenCalledTimes(1);
    expect(TOKEN_CONTRACT_SIGNER_MOCK.transferFrom).toHaveBeenCalledWith(
      ETHERS_WALLET_MOCK.address,
      SELLER_ADDRESS,
      ETHERS_PARSE_UNITS_MOCK,
      OPTIONS,
    );
  });
});
