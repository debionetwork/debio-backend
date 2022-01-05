import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationRole } from './dto/get-dbio-on-register.dto';
import { SubstrateService } from './substrate.service';

class SubstrateServiceMock {
  getSubstrateAddressByEthAddress(ethAddress: string) {
    return '';
  }

  getLastOrderByCustomer(substrateAddress: string) {
    return '';
  }

  getOrderDetailByOrderID(orderID: string) {
    return {};
  }

  getBalanceAccount(accountId: string) {
    return 0;
  }

  setOrderPaid(orderId: string) {
    return null;
  }

  setOrderRefunded(orderId: string) {
    return null;
  }

  sendDbioFromFaucet(accountId: string, amount: number | string) {
    return null;
  }

  hasRole(accountId: string, role: RegistrationRole) {
    return true;
  }

  listenToEvents() {
    return null;
  }

  bindEthAddressToSubstrateAddress(
    ethAddress: string,
    substrateAddress: string,
  ) {
    return {};
  }
}

describe('Substrate Service', () => {
  let substrateService: SubstrateService;

  const SubstrateServiceProvider = {
    provide: SubstrateService,
    useClass: SubstrateServiceMock,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubstrateService, SubstrateServiceProvider],
    }).compile();

    substrateService = module.get<SubstrateService>(SubstrateService);
  });

  describe('Service', () => {
    it('Substrate Service must defined', () => {
      expect(substrateService).toBeDefined();
    });

    it('should call getSubstrateAddressByEthAddress method with expected params', () => {
      const getSubstrateAddressByEthAddressSpy = jest.spyOn(
        substrateService,
        'getSubstrateAddressByEthAddress',
      );
      const ethAddress = '';
      substrateService.getSubstrateAddressByEthAddress(ethAddress);
      expect(getSubstrateAddressByEthAddressSpy).toHaveBeenCalledWith(
        ethAddress,
      );
    });

    it('should call getLastOrderByCustomer method with expected params', () => {
      const getLastOrderByCustomerSpy = jest.spyOn(
        substrateService,
        'getLastOrderByCustomer',
      );
      const substrateAddress = '';
      substrateService.getLastOrderByCustomer(substrateAddress);
      expect(getLastOrderByCustomerSpy).toHaveBeenCalledWith(substrateAddress);
    });

    it('should call getOrderDetailByOrderID method with expected params', () => {
      const getOrderDetailByOrderIDSpy = jest.spyOn(
        substrateService,
        'getOrderDetailByOrderID',
      );
      const orderID = '';
      substrateService.getOrderDetailByOrderID(orderID);
      expect(getOrderDetailByOrderIDSpy).toHaveBeenCalledWith(orderID);
    });

    it('should call getBalanceAccount method with expected params', () => {
      const getBalanceAccountSpy = jest.spyOn(
        substrateService,
        'getBalanceAccount',
      );
      const accountId = '';
      substrateService.getBalanceAccount(accountId);
      expect(getBalanceAccountSpy).toHaveBeenCalledWith(accountId);
    });

    it('should call setOrderPaid method with expected params', () => {
      const setOrderPaidSpy = jest.spyOn(substrateService, 'setOrderPaid');
      const orderId = '';
      substrateService.setOrderPaid(orderId);
      expect(setOrderPaidSpy).toHaveBeenCalledWith(orderId);
    });

    it('should call setOrderRefunded method with expected params', () => {
      const setOrderRefundedSpy = jest.spyOn(
        substrateService,
        'setOrderRefunded',
      );
      const setOrderRefunded = '';
      substrateService.setOrderRefunded(setOrderRefunded);
      expect(setOrderRefundedSpy).toHaveBeenCalledWith(setOrderRefunded);
    });

    it('should call sendDbioFromFaucet method with expected params', () => {
      const sendDbioFromFaucetSpy = jest.spyOn(
        substrateService,
        'sendDbioFromFaucet',
      );
      const accountId = '';
      const amount = '';
      substrateService.sendDbioFromFaucet(accountId, amount);
      expect(sendDbioFromFaucetSpy).toHaveBeenCalledWith(accountId, amount);
    });

    it('should call hasRole method with expected params', () => {
      const hasRoleSpy = jest.spyOn(substrateService, 'hasRole');
      const accountId = '';
      const role: RegistrationRole = 'lab';
      substrateService.hasRole(accountId, role);
      expect(hasRoleSpy).toHaveBeenCalledWith(accountId, role);
    });

    it('should call listenToEvents method with expected params', () => {
      const listenToEventsSpy = jest.spyOn(substrateService, 'listenToEvents');
      substrateService.listenToEvents();
      expect(listenToEventsSpy).toHaveBeenCalled();
    });

    it('should call bindEthAddressToSubstrateAddress method with expected params', () => {
      const bindEthAddressToSubstrateAddressSpy = jest.spyOn(
        substrateService,
        'bindEthAddressToSubstrateAddress',
      );
      const ethAddress = '';
      const substrateAddress = '';
      substrateService.bindEthAddressToSubstrateAddress(
        ethAddress,
        substrateAddress,
      );
      expect(bindEthAddressToSubstrateAddressSpy).toHaveBeenCalledWith(
        ethAddress,
        substrateAddress,
      );
    });
  });
});
