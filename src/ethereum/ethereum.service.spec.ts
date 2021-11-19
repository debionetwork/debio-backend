import { Test, TestingModule } from '@nestjs/testing';
import { EthereumService } from './ethereum.service';

class EtheretumServiceMock {
  getLastBlock(): number {
    return 5484746;
  }

  setLastBlock(blockNumber: number): void {
    return;
  }

  getContract(): any {
    return {
      provider: {
        getBlockNumber: () => 5484748,
        on: () => null,
      },
      on: () => null,
      filters: {
        Transfer: () => null,
      },
    };
  }

  createWallet(privateKey: string) {
    return {};
  }

  getGasEstimationFee(from, to, data = null) {
    return '';
  }

  convertCurrency(
    fromCurrency = 'ETH',
    toCurrency = 'DAI',
    amount: number | string,
  ) {
    return {};
  }
}

describe.only('EthereumService', () => {
  let ethereumService: EthereumService;

  beforeAll(async () => {
    const EthereumServiceProvider = {
      provide: EthereumService,
      useClass: EtheretumServiceMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EthereumService, EthereumServiceProvider],
    }).compile();

    ethereumService = module.get<EthereumService>(EthereumService);
  });

  it('should call getLastBlock method with expected params', async () => {
    const getLastBlockSpy = jest.spyOn(ethereumService, 'getLastBlock');
    ethereumService.getLastBlock();
    expect(getLastBlockSpy).toHaveBeenCalledWith();
  });

  it('should call setLastBlock method with expected params', async () => {
    const setLastBlockSpy = jest.spyOn(ethereumService, 'setLastBlock');
    const blockNumber = 0;
    ethereumService.setLastBlock(blockNumber);
    expect(setLastBlockSpy).toHaveBeenCalledWith(blockNumber);
  });

  it('should call getContract method with expected params', async () => {
    const getContractSpy = jest.spyOn(ethereumService, 'getContract');
    ethereumService.getContract();
    expect(getContractSpy).toHaveBeenCalledWith();
  });

  it('should call createWallet method with expected params', async () => {
    const createWalletSpy = jest.spyOn(ethereumService, 'createWallet');
    const privateKey = '';
    ethereumService.createWallet(privateKey);
    expect(createWalletSpy).toHaveBeenCalledWith(privateKey);
  });

  it('should call getGasEstimationFee method with expected params', async () => {
    const getGasEstimationFeeSpy = jest.spyOn(
      ethereumService,
      'getGasEstimationFee',
    );
    const from = '';
    const to = '';
    const data = {};
    ethereumService.getGasEstimationFee(from, to, data);
    expect(getGasEstimationFeeSpy).toHaveBeenCalledWith(from, to, data);
  });

  it('should call convertCurrency method with expected params', async () => {
    const convertCurrencySpy = jest.spyOn(ethereumService, 'convertCurrency');
    const fromCurrency = 'ETH';
    const toCurrency = 'DAI';
    const amount: number | string = 20;
    ethereumService.convertCurrency(fromCurrency, toCurrency, amount);
    expect(convertCurrencySpy).toHaveBeenCalledWith(
      fromCurrency,
      toCurrency,
      amount,
    );
  });
});
