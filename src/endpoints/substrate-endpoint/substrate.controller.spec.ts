import { Test, TestingModule } from '@nestjs/testing';
import { SubstrateController } from './substrate-endpoint.controller';
import {
  RegistrationRole,
  GetDbioOnRegisterDto,
  WalletBindingDTO,
} from './dto';
import { SubstrateService } from './substrate.service';

/* eslint-disable */

describe('Substrate Controller', () => {
  let substrateController: SubstrateController;
  let substrateService: SubstrateService;

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockRequest = (accountId, role) => {
    const response: GetDbioOnRegisterDto = new GetDbioOnRegisterDto();
    response.accountId = accountId;
    response.role = role;
    return response;
  };

  const mockRequestWallet = (accountId, ethAddress) => {
    const response: WalletBindingDTO = new WalletBindingDTO();
    response.accountId = accountId;
    response.ethAddress = ethAddress;
    return response;
  };

  const SubstrateServiceProvider = {
    provide: SubstrateService,
    useFactory: () => ({
      onModuleInit: jest.fn(),
      getSubstrateAddressByEthAddress: jest.fn(
        (ethAddress: string) => '0x38449f6e6b3f409565b88bcdd41061009e4bc349',
      ),
      getLastOrderByCustomer: jest.fn((substrateAddress: string) => ''),
      getOrderDetailByOrderID: jest.fn((orderID: string) => ({})),
      getBalanceAccount: jest.fn((accountId: string) => 0),
      setOrderPaid: jest.fn((orderId: string) => null),
      setOrderRefunded: jest.fn((orderId: string) => null),
      sendDbioFromFaucet: jest.fn(
        (accountId: string, amount: number | string) => null,
      ),
      hasRole: jest.fn((accountId: string, role: RegistrationRole) => true),
      listenToEvents: jest.fn(),
      bindEthAddressToSubstrateAddress: jest.fn(
        (ethAddress: string, substrateAddress: string) => ({}),
      ),
    }),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubstrateController],
      providers: [SubstrateService, SubstrateServiceProvider],
    }).compile();

    substrateController = module.get<SubstrateController>(SubstrateController);
    substrateService = module.get<SubstrateService>(SubstrateService);
  });

  describe('Controller Testing', () => {
    describe('All controller and providers is defined', () => {
      it('Substrate Controller must defined', () => {
        expect(substrateController).toBeDefined();
      });

      it('Substrate Service must defined', () => {
        expect(substrateService).toBeDefined();
      });
    });

    describe('Substrate Controller onApplicationBootstrap called', () => {
      it('onApplicationBootstrap called', async () => {
        await substrateController.onApplicationBootstrap();
        expect(substrateService.listenToEvents).toHaveBeenCalled();
      });
    });

    describe('When getDbioPreRegister is called if user send request to get-dbio-pre-register', () => {
      let responseDbioPreRegister;

      it('getDbioPreRegister called when account id is already registered, status response is 208 and response text is User has already registered.', async () => {
        const res = mockResponse();
        const accountId = process.env.DEBIO_ACCOUNT_ID_TEST;
        const role = 'lab';
        const req = mockRequest(accountId, role);

        responseDbioPreRegister = await substrateController.getDbioPreRegister(
          req,
          res,
        );
        expect(responseDbioPreRegister.status).toHaveBeenCalledWith(208);
        expect(responseDbioPreRegister.send).toHaveBeenCalledWith(
          'User has already registered',
        );
      });

      it('getDbioPreRegister called when account id is already registered must called substrateService method hasRole and called with parameter accountId and role', async () => {
        const res = mockResponse();
        const accountId = process.env.DEBIO_ACCOUNT_ID_TEST;
        const role = 'lab';
        const req = mockRequest(accountId, role);

        responseDbioPreRegister = await substrateController.getDbioPreRegister(
          req,
          res,
        );
        expect(substrateService.hasRole).toHaveBeenCalled();
        expect(substrateService.hasRole).toHaveBeenCalledWith(accountId, role);
      });

      it('getDbioPreRegister called when role is not found', async () => {
        const res = mockResponse();
        const accountId = process.env.DEBIO_ACCOUNT_ID_TEST;
        const role = 'labo';
        const req = mockRequest(accountId, role);

        responseDbioPreRegister = await substrateController.getDbioPreRegister(
          req,
          res,
        );
        expect(responseDbioPreRegister.status).toHaveBeenCalledWith(400);
        expect(responseDbioPreRegister.send).toHaveBeenCalledWith(
          'role not found',
        );
      });

      it('getDbioPreRegister called when account id is not found', async () => {
        const res = mockResponse();
        const accountId = null;
        const role = 'lab';
        const req = mockRequest(accountId, role);

        responseDbioPreRegister = await substrateController.getDbioPreRegister(
          req,
          res,
        );
        expect(responseDbioPreRegister.status).toHaveBeenCalledWith(400);
        expect(responseDbioPreRegister.send).toHaveBeenCalledWith(
          'accountId is required',
        );
      });
    });

    describe('When walletBinding is called if user send request to wallet-binding', () => {
      let responseWalletBinding;

      it("walletBinding called, when debioApiKey is not right, some substrateService method mustn't called", async () => {
        const res = mockResponse();
        const accountId = process.env.DEBIO_ACCOUNT_ID_TEST;
        const ethAddress = process.env.DEBIO_ETH_ADDRESS_TEST;
        const req = mockRequestWallet(accountId, ethAddress);
        const debioApiKey = null;

        responseWalletBinding = await substrateController.walletBinding(
          req,
          res,
          debioApiKey,
        );
        expect(
          substrateService.getSubstrateAddressByEthAddress,
        ).not.toHaveBeenCalled();
        expect(
          substrateService.bindEthAddressToSubstrateAddress,
        ).not.toHaveBeenCalled();
      });

      it('walletBinding called, response status must 200 when header is right', async () => {
        const res = mockResponse();
        const accountId = process.env.DEBIO_ACCOUNT_ID_TEST;
        const ethAddress = process.env.DEBIO_ETH_ADDRESS_TEST;
        const req = mockRequestWallet(accountId, ethAddress);
        const debioApiKey = process.env.DEBIO_API_KEY;

        const substrateAddress =
          await substrateService.getSubstrateAddressByEthAddress(ethAddress);

        responseWalletBinding = await substrateController.walletBinding(
          req,
          res,
          debioApiKey,
        );
        expect(responseWalletBinding.status).toHaveBeenCalledWith(200);
        expect(responseWalletBinding.send).toHaveBeenCalledWith(
          `eth-address ${ethAddress} bound to ${substrateAddress}`,
        );
      });

      it('when walletBinding is running, getSubstrateAddressByEthAddress must called, bindEthAddressToSubstrateAddress must called', async () => {
        const res = mockResponse();
        const accountId = process.env.DEBIO_ACCOUNT_ID_TEST;
        const ethAddress = process.env.DEBIO_ETH_ADDRESS_TEST;
        const req = mockRequestWallet(accountId, ethAddress);
        const debioApiKey = process.env.DEBIO_API_KEY;

        responseWalletBinding = await substrateController.walletBinding(
          req,
          res,
          debioApiKey,
        );
        expect(
          substrateService.getSubstrateAddressByEthAddress,
        ).toHaveBeenCalled();
        expect(
          substrateService.getSubstrateAddressByEthAddress,
        ).toHaveBeenCalledWith(ethAddress);
        expect(
          substrateService.bindEthAddressToSubstrateAddress,
        ).toHaveBeenCalled();
        expect(
          substrateService.bindEthAddressToSubstrateAddress,
        ).toHaveBeenCalledWith(ethAddress, accountId);
      });

      it('walletBinding called, response status must 400 when header is not right', async () => {
        const res = mockResponse();
        const accountId = process.env.DEBIO_ACCOUNT_ID_TEST;
        const ethAddress = process.env.DEBIO_ETH_ADDRESS_TEST;
        const req = mockRequestWallet(accountId, ethAddress);
        const debioApiKey = null;

        responseWalletBinding = await substrateController.walletBinding(
          req,
          res,
          debioApiKey,
        );
        expect(responseWalletBinding.status).toHaveBeenCalledWith(401);
        expect(responseWalletBinding.send).toHaveBeenCalledWith(
          'debio-api-key header is required',
        );
      });
    });
  });
});
