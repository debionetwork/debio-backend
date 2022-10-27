import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { NotificationService } from '../../../../src/common/modules/notification/notification.service';
import { LabService } from '../../../../src/endpoints/substrate-endpoint/services/lab.service';
import { ServiceService } from '../../../../src/endpoints/substrate-endpoint/services/service.service';
import {
  dateTimeProxyMockFactory,
  MockType,
  notificationServiceMockFactory,
} from '../../mock';
import { SubstrateController } from '../../../../src/endpoints/substrate-endpoint/substrate-endpoint.controller';
import {
  OrderService,
  ServiceRequestService,
  GeneticAnalysisService,
  GeneticAnalysisOrderService,
  MenstrualCalendarService,
} from '../../../../src/endpoints/substrate-endpoint/services';
import {
  DateTimeProxy,
  TransactionLoggingService,
  SubstrateService,
} from '../../../../src/common';
import { WalletBindingDTO } from '../../../../src/endpoints/substrate-endpoint/dto';
import {
  queryAccountIdByEthAddress,
  setEthAddress,
  setGeneticAnalysisOrderPaid,
  adminSetEthAddress,
} from '@debionetwork/polkadot-provider';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';

jest.mock('@debionetwork/polkadot-provider', () => ({
  queryAccountIdByEthAddress: jest.fn(),
  setEthAddress: jest.fn(),
  adminSetEthAddress: jest.fn(
    (_param1, _param2, _param3, _param4, param5) => param5 && param5(),
  ),
  sendRewards: jest.fn(
    (_param1, _param2, _param3, _param4, param5) => param5 && param5(),
  ),
  setGeneticAnalysisOrderPaid: jest.fn(),
}));

describe('Substrate Endpoint Controller Unit Tests', () => {
  let substrateControllerMock: SubstrateController;
  let labServiceMock: MockType<LabService>;
  let serviceServiceMock: MockType<ServiceService>;
  let orderServiceMock: MockType<OrderService>;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let dateTimeProxyMock: MockType<DateTimeProxy>;
  let serviceRequestMock: MockType<ServiceRequestService>;
  let geneticAnalysisMock: MockType<GeneticAnalysisService>;
  let geneticAnalysisOrderMock: MockType<GeneticAnalysisOrderService>;

  const DEBIO_API_KEY = 'KEY';

  const labServiceMockFactory: () => MockType<LabService> = jest.fn(() => ({
    getByCountryCityCategory: jest.fn(),
  }));

  const serviceServiceMockFactory: () => MockType<ServiceService> = jest.fn(
    () => ({
      getByCountryCity: jest.fn(),
    }),
  );

  const orderServiceMockFactory: () => MockType<OrderService> = jest.fn(() => ({
    getBountyList: jest.fn(),
    getOrderByHashId: jest.fn(),
    getOrderList: jest.fn(),
  }));

  const menstrualCalendarServiceMockFactory: () => MockType<MenstrualCalendarService> = jest.fn(() => ({
    getMenstrualCycleLogByMonth: jest.fn(),
  }));

  const serviceRequestServiceMockFactory: () => MockType<ServiceRequestService> =
    jest.fn(() => ({
      getAggregatedByCountries: jest.fn(),
      getByCustomerId: jest.fn(),
      provideRequestService: jest.fn(),
    }));

  const transactionLoggingServiceMockFactory: () => MockType<TransactionLoggingService> =
    jest.fn(() => ({
      getRewardBindingByAccountId: jest.fn(),
      create: jest.fn(),
    }));

  const geneticAnalysisMockfactory: () => MockType<GeneticAnalysisService> =
    jest.fn(() => ({
      getGeneticAnalysisByTrackingId: jest.fn(),
    }));

  const geneticAnalysisOrderMockfactory: () => MockType<GeneticAnalysisOrderService> =
    jest.fn(() => ({
      geneticAnalysisSetOrderPaid: jest.fn(),
      getGeneticAnalysisOrderList: jest.fn(),
      getGeneticAnalysisOrderById: jest.fn(),
    }));

  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([['DEBIO_API_KEY', DEBIO_API_KEY]]);
    loadSecrets() {
      return null;
    }

    getSecret(key) {
      return this._secretsList.get(key);
    }
  }

  class SubstrateServiceMock {
    api = 'API';
    pair = 'PAIR';
  }

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubstrateController,
        { provide: SubstrateService, useClass: SubstrateServiceMock },
        { provide: LabService, useFactory: labServiceMockFactory },
        { provide: ServiceService, useFactory: serviceServiceMockFactory },
        { provide: OrderService, useFactory: orderServiceMockFactory },
        { provide: MenstrualCalendarService, useFactory: menstrualCalendarServiceMockFactory },
        {
          provide: NotificationService,
          useFactory: notificationServiceMockFactory,
        },
        {
          provide: ServiceRequestService,
          useFactory: serviceRequestServiceMockFactory,
        },
        {
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory,
        },
        {
          provide: GeneticAnalysisService,
          useFactory: geneticAnalysisMockfactory,
        },
        {
          provide: GeneticAnalysisOrderService,
          useFactory: geneticAnalysisOrderMockfactory,
        },
        { provide: DateTimeProxy, useFactory: dateTimeProxyMockFactory },
        {
          provide: GCloudSecretManagerService,
          useClass: GoogleSecretManagerServiceMock,
        },
      ],
    }).compile();

    substrateControllerMock = module.get(SubstrateController);
    labServiceMock = module.get(LabService);
    serviceServiceMock = module.get(ServiceService);
    orderServiceMock = module.get(OrderService);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    dateTimeProxyMock = module.get(DateTimeProxy);
    serviceRequestMock = module.get(ServiceRequestService);
    geneticAnalysisMock = module.get(GeneticAnalysisService);
    geneticAnalysisOrderMock = module.get(GeneticAnalysisOrderService);
  });

  it('should be defined', () => {
    // Assert
    expect(substrateControllerMock).toBeDefined();
    expect(labServiceMock).toBeDefined();
    expect(serviceServiceMock).toBeDefined();
    expect(orderServiceMock).toBeDefined();
    expect(transactionLoggingServiceMock).toBeDefined();
    expect(serviceRequestMock).toBeDefined();
    expect(geneticAnalysisMock).toBeDefined();
    expect(geneticAnalysisOrderMock).toBeDefined();
  });

  it('should find lab by country, city, and category', () => {
    // Arrange
    const RESULT = 1;
    labServiceMock.getByCountryCityCategory.mockReturnValue(RESULT);

    // Assert
    expect(
      substrateControllerMock.findByCountryCityCategory(
        'XX',
        'XX',
        'XX',
        'XX',
        1,
        10,
      ),
    ).resolves.toEqual(RESULT);
    expect(labServiceMock.getByCountryCityCategory).toHaveBeenCalled();
    expect(labServiceMock.getByCountryCityCategory).toHaveBeenCalledWith(
      'XX',
      'XX',
      'XX',
      'XX',
      1,
      10,
    );
  });

  it('should find service by country, city, and category', () => {
    // Arrange
    const RESULT = 1;
    serviceServiceMock.getByCountryCity.mockReturnValue(RESULT);

    // Assert
    expect(
      substrateControllerMock.findByCountryCity({
        city: 'XX',
        country: 'XX',
      }),
    ).resolves.toEqual(RESULT);
    expect(serviceServiceMock.getByCountryCity).toHaveBeenCalled();
    expect(serviceServiceMock.getByCountryCity).toHaveBeenCalledWith(
      'XX',
      'XX',
    );
  });

  it('should orders by order Id', () => {
    // Arrange
    const RETURN_VALUE = 1;
    const RESULT = RETURN_VALUE;

    orderServiceMock.getOrderByHashId.mockReturnValue(RETURN_VALUE);

    // Assert
    expect(substrateControllerMock.getOrderById('keyword')).resolves.toEqual(
      RESULT,
    );
    expect(orderServiceMock.getOrderByHashId).toBeCalled();
    expect(orderServiceMock.getOrderByHashId).toHaveBeenCalledWith('keyword');
  });

  it('should orders list by customer', async () => {
    // Arrange
    const RESULT = 1;
    orderServiceMock.getOrderList.mockReturnValue(RESULT);
    geneticAnalysisOrderMock.getGeneticAnalysisOrderList.mockReturnValue(
      RESULT,
    );

    // Assert
    expect(
      await substrateControllerMock.getOrderByCustomer(
        { customer_id: 1 },
        'keyword',
        1,
        10,
      ),
    ).toEqual({ orders: RESULT, ordersGA: RESULT });
    expect(orderServiceMock.getOrderList).toHaveBeenCalled();
    expect(orderServiceMock.getOrderList).toHaveBeenCalledWith(
      'customer',
      1,
      'keyword',
      1,
      10,
    );
    expect(
      geneticAnalysisOrderMock.getGeneticAnalysisOrderList,
    ).toHaveBeenCalled();
    expect(
      geneticAnalysisOrderMock.getGeneticAnalysisOrderList,
    ).toHaveBeenCalledWith('customer', 1, 'keyword', 1, 10);
  });

  it('should genetic analysis orders list by customer', () => {
    // Arrange
    const RESULT = 1;
    geneticAnalysisOrderMock.getGeneticAnalysisOrderList.mockReturnValue(
      RESULT,
    );

    // Assert
    expect(
      substrateControllerMock.getGeneticAnalysisOrderByCustomer(
        { customer_id: 1 },
        'keyword',
        1,
        10,
      ),
    ).resolves.toEqual(RESULT);
    expect(
      geneticAnalysisOrderMock.getGeneticAnalysisOrderList,
    ).toHaveBeenCalled();
    expect(
      geneticAnalysisOrderMock.getGeneticAnalysisOrderList,
    ).toHaveBeenCalledWith('customer', 1, 'keyword', 1, 10);
  });

  it('should genetic analysis orders list by analyst', () => {
    // Arrange
    const RESULT = 1;
    geneticAnalysisOrderMock.getGeneticAnalysisOrderList.mockReturnValue(
      RESULT,
    );

    // Assert
    expect(
      substrateControllerMock.getGeneticAnalysisOrderByAnalyst(
        { analyst_id: 1 },
        'keyword',
        1,
        10,
      ),
    ).resolves.toEqual(RESULT);
    expect(
      geneticAnalysisOrderMock.getGeneticAnalysisOrderList,
    ).toHaveBeenCalled();
    expect(
      geneticAnalysisOrderMock.getGeneticAnalysisOrderList,
    ).toHaveBeenCalledWith('analyst', 1, 'keyword', 1, 10);
  });

  it('should bounty by product name status lab name', () => {
    // Arrange
    const RESULT = 1;
    orderServiceMock.getBountyList.mockReturnValue(RESULT);

    // Assert
    expect(
      substrateControllerMock.getBountyByProductNameStatusLabName(
        { customer_id: 1 },
        'keyword',
        1,
        10,
      ),
    ).resolves.toEqual(RESULT);
    expect(orderServiceMock.getBountyList).toHaveBeenCalled();
    expect(orderServiceMock.getBountyList).toHaveBeenCalledWith(
      1,
      'keyword',
      1,
      10,
    );
  });

  it('should orders list by lab', () => {
    // Arrange
    const RESULT = 1;
    orderServiceMock.getOrderList.mockReturnValue(RESULT);

    // Assert
    expect(
      substrateControllerMock.getOrderByLab({ lab_id: 1 }, 'keyword', 1, 10),
    ).resolves.toEqual(RESULT);
    expect(orderServiceMock.getOrderList).toHaveBeenCalled();
    expect(orderServiceMock.getOrderList).toHaveBeenCalledWith(
      'lab',
      1,
      'keyword',
      1,
      10,
    );
  });

  it('should service request list by customerId', () => {
    // Arrange
    const RESULT = 1;
    serviceRequestMock.getByCustomerId.mockReturnValue(RESULT);

    // Assert
    expect(
      substrateControllerMock.getServiceRequestByCustomer(
        { customer_id: 1 },
        1,
        10,
      ),
    ).resolves.toEqual(RESULT);
    expect(serviceRequestMock.getByCustomerId).toHaveBeenCalled();
    expect(serviceRequestMock.getByCustomerId).toHaveBeenCalledWith(
      { customer_id: 1 },
      1,
      10,
    );
  });

  it('should service request countries', () => {
    // Arrange
    const PAGE = 1;
    const SIZE = 2;
    const RESULT = 1;
    serviceRequestMock.getAggregatedByCountries.mockReturnValue(RESULT);

    // Assert
    expect(
      substrateControllerMock.getAggregatedByCountries(PAGE, SIZE),
    ).resolves.toEqual(RESULT);
    expect(serviceRequestMock.getAggregatedByCountries).toHaveBeenCalled();
    expect(serviceRequestMock.getAggregatedByCountries).toHaveBeenCalledWith(
      PAGE,
      SIZE,
    );
  });

  it('should not wallet bind with false API key', async () => {
    // Arrange
    const EXPECTED_RESULTS = 'debio-api-key header is required';
    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS, // eslint-disable-line
      status: (code: number) => RESPONSE, // eslint-disable-line
    } as Response;
    const DTO: WalletBindingDTO = {
      role: 'Customer',
      accountId: 'string',
      ethAddress: 'string',
    };

    // Assert
    expect(
      await substrateControllerMock.walletBinding('NOT API KEY', DTO, RESPONSE),
    ).toEqual(EXPECTED_RESULTS);
    expect(queryAccountIdByEthAddress).toHaveBeenCalledTimes(0);
    expect(setEthAddress).toHaveBeenCalledTimes(0);
  });

  it('should genetic analysis by tracking id', () => {
    // Arrange
    const RESULT = 1;
    geneticAnalysisMock.getGeneticAnalysisByTrackingId.mockReturnValue(RESULT);

    // Assert
    expect(
      substrateControllerMock.getGeneticAnalysisByTrackingId('trackingId'),
    ).resolves.toEqual(RESULT);
    expect(
      geneticAnalysisMock.getGeneticAnalysisByTrackingId,
    ).toHaveBeenCalled();
    expect(
      geneticAnalysisMock.getGeneticAnalysisByTrackingId,
    ).toHaveBeenCalledWith('trackingId');
  });

  it('should not wallet bind with binding error', async () => {
    // Arrange
    const EXPECTED_RESULTS = 'Binding Error';
    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS, // eslint-disable-line
      status: (code: number) => RESPONSE, // eslint-disable-line
    } as Response;
    const DTO: WalletBindingDTO = {
      role: 'Customer',
      accountId: 'strin',
      ethAddress: 'string',
    };
    (queryAccountIdByEthAddress as jest.Mock).mockReturnValue(1);
    (adminSetEthAddress as jest.Mock).mockImplementationOnce(() => {
      throw new Error();
    });

    // Assert
    expect(
      await substrateControllerMock.walletBinding(DEBIO_API_KEY, DTO, RESPONSE),
    ).toEqual(EXPECTED_RESULTS);
    expect(adminSetEthAddress).toHaveBeenCalled();
    expect(adminSetEthAddress).toHaveBeenCalledWith(
      'API',
      'PAIR',
      DTO.accountId,
      DTO.ethAddress,
      expect.any(Function),
    );
  });

  it('should wallet bind', async () => {
    // Arrange
    const DTO: WalletBindingDTO = {
      role: 'Customer',
      accountId: 'string',
      ethAddress: 'string',
    };
    const EXPECTED_RESULTS = {
      message: `eth-address ${DTO.ethAddress} bound to ${DTO.accountId}`,
    };
    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS, // eslint-disable-line
      status: (code: number) => RESPONSE, // eslint-disable-line
    } as Response;
    (queryAccountIdByEthAddress as jest.Mock).mockReturnValue(false);
    transactionLoggingServiceMock.getRewardBindingByAccountId.mockReturnValue(
      false,
    );
    dateTimeProxyMock.new.mockReturnValue(1);

    // Assert
    expect(
      await substrateControllerMock.walletBinding(DEBIO_API_KEY, DTO, RESPONSE),
    ).toEqual(EXPECTED_RESULTS);
    expect(adminSetEthAddress).toHaveBeenCalled();
    expect(adminSetEthAddress).toHaveBeenCalledWith(
      'API',
      'PAIR',
      DTO.accountId,
      DTO.ethAddress,
      expect.any(Function),
    );
  });

  it('should not set genetic analysis order paid with false API key', async () => {
    // Arrange
    const EXPECTED_RESULTS = 'debio-api-key header is required';
    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS, // eslint-disable-line
      status: (code: number) => RESPONSE, // eslint-disable-line
    } as Response;
    const genetic_analysis_order_id = { genetic_analysis_order_id: 'XX' };

    // Assert
    expect(
      await substrateControllerMock.geneticAnalysisOrderPaid(
        'NOT API KEY',
        genetic_analysis_order_id,
        RESPONSE,
      ),
    ).toEqual(EXPECTED_RESULTS);
  });

  it('should set genetic analysis order paid', async () => {
    const genetic_analysis_order_id = { genetic_analysis_order_id: 'XX' };
    const EXPECTED_RESULTS = `set order paid with genetic analysis order id ${genetic_analysis_order_id} on progress`;
    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS, // eslint-disable-line
      status: (code: number) => RESPONSE, // eslint-disable-line
    } as Response;
    (setGeneticAnalysisOrderPaid as jest.Mock).mockReturnValue(true);

    //Assert
    expect(
      await substrateControllerMock.geneticAnalysisOrderPaid(
        DEBIO_API_KEY,
        genetic_analysis_order_id,
        RESPONSE,
      ),
    ).toEqual(EXPECTED_RESULTS);
    expect(setGeneticAnalysisOrderPaid).toHaveBeenCalled();
    expect(setGeneticAnalysisOrderPaid).toHaveBeenCalledWith(
      'API',
      'PAIR',
      genetic_analysis_order_id.genetic_analysis_order_id,
    );
  });
});
