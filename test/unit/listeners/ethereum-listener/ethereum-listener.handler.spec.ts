import { Test, TestingModule } from '@nestjs/testing';
import { EscrowService } from '../../../../src/endpoints/escrow/escrow.service';
import { EthereumListenerHandler } from '../../../../src/listeners/ethereum-listener/ethereum-listener.handler';
import { EthereumService } from '../../../../src/common';

describe('EthereumListenerHandler', () => {
  let ethereumListenerHandler: EthereumListenerHandler;
  let ethereumService: EthereumService;
  let escrowService: EscrowService;

  const escrowServiceProvider = {
    provide: EscrowService,
    useFactory: () => ({
      handlePaymentToEscrow: jest.fn(),
      createOrder: jest.fn(),
      refundOrder: jest.fn(),
      cancelOrder: jest.fn(),
      orderFulfilled: jest.fn(),
      forwardPaymentToSeller: jest.fn(),
      getRefundGasEstimationFee: jest.fn(() => ''),
    }),
  };

  const escrowContractMock = {
    on: jest.fn(),
  };

  const ethereumServiceProvider = {
    provide: EthereumService,
    useFactory: () => ({
      getLastBlock: jest.fn(() => 5484750),
      setLastBlock: jest.fn(),
      getContract: jest.fn(() => ({
        provider: {
          getBlockNumber: () => 5484751,
          on: () => null,
          emit: jest.fn(),
        },
        on: () => null,
        filters: {
          Transfer: () => null,
        },
        emit: jest.fn(),
      })),
      getEscrowSmartContract: jest.fn(() => escrowContractMock),
      createWallet: jest.fn(),
      getGasEstimationFee: jest.fn(() => ''),
      convertCurrency: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EthereumListenerHandler,
        EscrowService,
        escrowServiceProvider,
        EthereumService,
        ethereumServiceProvider,
      ],
    }).compile();

    ethereumListenerHandler = module.get<EthereumListenerHandler>(EthereumListenerHandler);
    ethereumService = module.get<EthereumService>(EthereumService);
    escrowService = module.get<EscrowService>(EscrowService);
  });

  it('EthereumListenerHandler must defined', () => {
    expect(ethereumListenerHandler).toBeDefined();
  });

  it('EthereumService must defined', () => {
    expect(ethereumService).toBeDefined();
  });

  it('EscrowService must defined', () => {
    expect(escrowService).toBeDefined();
  });

  describe('EthereumListenerHandler when method listenToEvents called', () => {
    it('getContract is called when listenToEvents called', async () => {
      await ethereumListenerHandler.listenToEvents();

      expect(ethereumService.getContract).toBeCalled();
    });

    it('getLastBlock is called when listenToEvents called', async () => {
      await ethereumListenerHandler.listenToEvents();
      expect(ethereumService.getLastBlock).toBeCalled();
    });

    it('setLastBlock is called when listenToEvents called', async () => {
      await ethereumListenerHandler.listenToEvents();
      expect(ethereumService.setLastBlock).toBeCalled();
    });

    it('ethereumService.setLastBlock is called when contract provider event block is listen', async () => {
      await ethereumListenerHandler.listenToEvents();
      const contract = await ethereumService.getContract();
      contract.provider.emit('block');
      expect(ethereumService.setLastBlock).toBeCalled();
    });
  });
});
