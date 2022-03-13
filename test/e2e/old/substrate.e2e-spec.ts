/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import {
  SubstrateController,
  RegistrationRole,
  GetDbioOnRegisterDto,
  WalletBindingDTO,
} from '../src/substrate/substrate.controller';
import { SubstrateService } from '../src/substrate/substrate.service';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('Substrate Controller', () => {
  let substrateController: SubstrateController;
  let substrateService: SubstrateService;
  let app: INestApplication;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubstrateController],
      providers: [SubstrateService, SubstrateServiceProvider],
    }).compile();

    substrateController = module.get<SubstrateController>(SubstrateController);
    substrateService = module.get<SubstrateService>(SubstrateService);
    app = module.createNestApplication();
    await app.init();
  });

  describe('Controller Testing', () => {
    it('/substrate/get-dbio-pre-register right return 208', async () => {
      const accountId = process.env.DEBIO_ACCOUNT_ID_TEST;
      const role = 'lab';
      return request(app.getHttpServer())
        .post('/substrate/get-dbio-pre-register')
        .send({
          accountId: accountId,
          role: role,
        })
        .expect(208);
    });

    it('/substrate/get-dbio-pre-register return 400 account null', async () => {
      const role = 'lab';
      return request(app.getHttpServer())
        .post('/substrate/get-dbio-pre-register')
        .send({
          accountId: null,
          role: role,
        })
        .expect(400)
        .expect('accountId is required');
    });

    it('/substrate/get-dbio-pre-register return 400 role not exists', async () => {
      const accountId = process.env.DEBIO_ACCOUNT_ID_TEST;
      const role = 'labo';
      request(app.getHttpServer())
        .post('/substrate/get-dbio-pre-register')
        .send({
          accountId: accountId,
          role: role,
        })
        .expect(400)
        .expect('role not found');
    });

    it('/substrate/wallet-binding 200 accountid and ethAddress exists', async () => {
      const accountId = process.env.DEBIO_ACCOUNT_ID_TEST;
      const ethAddress = process.env.DEBIO_ETH_ADDRESS_TEST;
      const debioApiKey = process.env.DEBIO_API_KEY;
      request(app.getHttpServer())
        .post('/wallet-binding')
        .send({
          accountId: accountId,
          ethAddress: ethAddress,
        })
        .set('debio-api-key', debioApiKey)
        .expect(200);
    });

    it('/substrate/wallet-binding 401 header debio-api-key is not required', async () => {
      const accountId = process.env.DEBIO_ACCOUNT_ID_TEST;
      const ethAddress = process.env.DEBIO_ETH_ADDRESS_TEST;
      request(app.getHttpServer())
        .post('/wallet-binding')
        .send({
          accountId: accountId,
          ethAddress: ethAddress,
        })
        .expect(401)
        .expect('debio-api-key header is required');
    });
  });
});
