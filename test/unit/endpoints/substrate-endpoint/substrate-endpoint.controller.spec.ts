import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { LabService } from '../../../../src/endpoints/substrate-endpoint/services/lab.service';
import { ServiceService } from '../../../../src/endpoints/substrate-endpoint/services/service.service';
import { dateTimeProxyMockFactory, MockType } from '../../mock';
import { SubstrateController } from '../../../../src/endpoints/substrate-endpoint/substrate-endpoint.controller';
import {
  OrderService,
  ServiceRequestService,
  GeneticAnalysisService,
} from '../../../../src/endpoints/substrate-endpoint/services';
import {
  DateTimeProxy,
  ProcessEnvProxy,
  RewardService,
  SubstrateService,
} from '../../../../src/common';
import { WalletBindingDTO } from '../../../../src/endpoints/substrate-endpoint/dto';
import {
  queryAccountIdByEthAddress,
  setEthAddress,
  sendRewards,
  setGeneticAnalysisOrderPaid
} from '../../../../src/common/polkadot-provider';

jest.mock('../../../../src/common/polkadot-provider', () => ({
  queryAccountIdByEthAddress: jest.fn(),
  setEthAddress: jest.fn(),
  sendRewards: jest.fn(),
  setGeneticAnalysisOrderPaid: jest.fn(),
}));

describe('Substrate Endpoint Controller Unit Tests', () => {
  let substrateControllerMock: SubstrateController;
  let labServiceMock: MockType<LabService>;
  let serviceServiceMock: MockType<ServiceService>;
  let orderServiceMock: MockType<OrderService>;
  let rewardServiceMock: MockType<RewardService>;
  let dateTimeProxyMock: MockType<DateTimeProxy>;
  let serviceRequestMock: MockType<ServiceRequestService>;
  let geneticAnalysisMock: MockType<GeneticAnalysisService>

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

  const serviceRequestServiceMockFactory: () => MockType<ServiceRequestService> =
    jest.fn(() => ({
      getAggregatedByCountries: jest.fn(),
      getByCustomerId: jest.fn(),
      provideRequestService: jest.fn(),
    }));

  const rewardServiceMockFactory: () => MockType<RewardService> = jest.fn(
    () => ({
      getRewardBindingByAccountId: jest.fn(),
      insert: jest.fn(),
    }),
  );

  const geneticAnalysisMockfactory: () => MockType<GeneticAnalysisService> = jest.fn(
    () => ({
      getGeneticAnalysisByTrackingId: jest.fn(),
      geneticAnalysisSetOrderPaid: jest.fn(),
    }),
  );

  class ProcessEnvProxyMock {
    env = {
      DEBIO_API_KEY,
    };
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
        {
          provide: ServiceRequestService,
          useFactory: serviceRequestServiceMockFactory,
        },
        { provide: RewardService, useFactory: rewardServiceMockFactory },
        { provide: GeneticAnalysisService, useFactory: geneticAnalysisMockfactory },
        { provide: DateTimeProxy, useFactory: dateTimeProxyMockFactory },
        { provide: ProcessEnvProxy, useClass: ProcessEnvProxyMock },
      ],
    }).compile();

    substrateControllerMock = module.get(SubstrateController);
    labServiceMock = module.get(LabService);
    serviceServiceMock = module.get(ServiceService);
    orderServiceMock = module.get(OrderService);
    rewardServiceMock = module.get(RewardService);
    dateTimeProxyMock = module.get(DateTimeProxy);
    serviceRequestMock = module.get(ServiceRequestService);
    geneticAnalysisMock = module.get(GeneticAnalysisService);
  });

  it('should be defined', () => {
    // Assert
    expect(substrateControllerMock).toBeDefined();
    expect(labServiceMock).toBeDefined();
    expect(serviceServiceMock).toBeDefined();
    expect(orderServiceMock).toBeDefined();
    expect(rewardServiceMock).toBeDefined();
    expect(serviceRequestMock).toBeDefined();
    expect(geneticAnalysisMock).toBeDefined();
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
        false,
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
      false,
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
    const RESULT = 1;
    orderServiceMock.getOrderByHashId.mockReturnValue(RESULT);

    // Assert
    expect(substrateControllerMock.getOrderById('keyword')).resolves.toEqual(
      RESULT,
    );
    expect(orderServiceMock.getOrderByHashId).toHaveBeenCalled();
    expect(orderServiceMock.getOrderByHashId).toHaveBeenCalledWith('keyword');
  });

  it('should orders list by customer', () => {
    // Arrange
    const RESULT = 1;
    orderServiceMock.getOrderList.mockReturnValue(RESULT);

    // Assert
    expect(
      substrateControllerMock.getOrderByCustomer(
        { customer_id: 1 },
        'keyword',
        1,
        10,
      ),
    ).resolves.toEqual(RESULT);
    expect(orderServiceMock.getOrderList).toHaveBeenCalled();
    expect(orderServiceMock.getOrderList).toHaveBeenCalledWith(
      'customer',
      1,
      'keyword',
      1,
      10,
    );
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

  it('should service request list by customer_id', () => {
    // Arrange
    const RESULT = 1;
    serviceRequestMock.getByCustomerId.mockReturnValue(RESULT);

    // Assert
    expect(
      substrateControllerMock.getServiceRequestByCustomer(
        { customerId: 1 },
        1,
        10,
      ),
    ).resolves.toEqual(RESULT);
    expect(serviceRequestMock.getByCustomerId).toHaveBeenCalled();
    expect(serviceRequestMock.getByCustomerId).toHaveBeenCalledWith(
      { customerId: 1 },
      1,
      10,
    );
  });

  it('should service request countries', () => {
    // Arrange
    const RESULT = 1;
    serviceRequestMock.getAggregatedByCountries.mockReturnValue(RESULT);

    // Assert
    expect(substrateControllerMock.getAggregatedByCountries()).resolves.toEqual(
      RESULT,
    );
    expect(serviceRequestMock.getAggregatedByCountries).toHaveBeenCalled();
    expect(serviceRequestMock.getAggregatedByCountries).toHaveBeenCalledWith();
  });

  it('should not wallet bind with false API key', async () => {
    // Arrange
    const EXPECTED_RESULTS = 'debio-api-key header is required';
    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS, // eslint-disable-line
      status: (code: number) => RESPONSE, // eslint-disable-line
    } as Response;
    const DTO: WalletBindingDTO = {
      accountId: 'string',
      ethAddress: 'string',
    };

    // Assert
    expect(
      await substrateControllerMock.walletBinding(DTO, RESPONSE, 'NOT API KEY'),
    ).toEqual(EXPECTED_RESULTS);
    expect(queryAccountIdByEthAddress).toHaveBeenCalledTimes(0);
    expect(setEthAddress).toHaveBeenCalledTimes(0);
  });

  it('should genetic analysis by tracking id', () => {
    // Arrange
    const RESULT = 1;
    geneticAnalysisMock.getGeneticAnalysisByTrackingId.mockReturnValue(RESULT);

    // Assert
    expect(substrateControllerMock.getGeneticAnalysisByTrackingId('trackingId')).resolves.toEqual(
      RESULT,
    );
    expect(geneticAnalysisMock.getGeneticAnalysisByTrackingId).toHaveBeenCalled();
    expect(geneticAnalysisMock.getGeneticAnalysisByTrackingId).toHaveBeenCalledWith('trackingId');
  });

  it('should not wallet bind with binding error', async () => {
    // Arrange
    const EXPECTED_RESULTS = 'Binding Error';
    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS, // eslint-disable-line
      status: (code: number) => RESPONSE, // eslint-disable-line
    } as Response;
    const DTO: WalletBindingDTO = {
      accountId: 'string',
      ethAddress: 'string',
    };
    (queryAccountIdByEthAddress as jest.Mock).mockReturnValue(1);
    (setEthAddress as jest.Mock).mockReturnValue(false);

    // Assert
    expect(
      await substrateControllerMock.walletBinding(DTO, RESPONSE, DEBIO_API_KEY),
    ).toEqual(EXPECTED_RESULTS);
    expect(queryAccountIdByEthAddress).toHaveBeenCalled();
    expect(queryAccountIdByEthAddress).toHaveBeenCalledWith(
      'API',
      DTO.ethAddress,
    );
    expect(setEthAddress).toHaveBeenCalled();
    expect(setEthAddress).toHaveBeenCalledWith(
      'API',
      'PAIR',
      DTO.accountId,
      DTO.ethAddress,
    );
  });

  it('should wallet bind', async () => {
    // Arrange
    const DTO: WalletBindingDTO = {
      accountId: 'string',
      ethAddress: 'string',
    };
    const DBIO_UNIT = 10 ** 18;
    const REWARD = 0.2;
    const EXPECTED_RESULTS = {
      reward: REWARD,
      message: `eth-address ${DTO.ethAddress} bound to ${DTO.accountId}`,
    };
    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS, // eslint-disable-line
      status: (code: number) => RESPONSE, // eslint-disable-line
    } as Response;
    (queryAccountIdByEthAddress as jest.Mock).mockReturnValue(false);
    (setEthAddress as jest.Mock).mockReturnValue(true);
    rewardServiceMock.getRewardBindingByAccountId.mockReturnValue(false);
    dateTimeProxyMock.new.mockReturnValue(1);

    // Assert
    expect(
      await substrateControllerMock.walletBinding(DTO, RESPONSE, DEBIO_API_KEY),
    ).toEqual(EXPECTED_RESULTS);
    expect(queryAccountIdByEthAddress).toHaveBeenCalled();
    expect(queryAccountIdByEthAddress).toHaveBeenCalledWith(
      'API',
      DTO.ethAddress,
    );
    expect(setEthAddress).toHaveBeenCalled();
    expect(setEthAddress).toHaveBeenCalledWith(
      'API',
      'PAIR',
      DTO.accountId,
      DTO.ethAddress,
    );
    expect(sendRewards).toHaveBeenCalled();
    expect(sendRewards).toHaveBeenCalledWith(
      'API',
      'PAIR',
      DTO.accountId,
      (REWARD * DBIO_UNIT).toString(),
    );
    expect(rewardServiceMock.insert).toHaveBeenCalled();
    expect(rewardServiceMock.insert).toHaveBeenCalledWith({
      address: DTO.accountId,
      ref_number: '-',
      reward_amount: REWARD,
      reward_type: 'Registered User',
      currency: 'DBIO',
      created_at: dateTimeProxyMock.new(),
    });
  });

  it('should not set genetic analysis order paid with false API key', async () => {
    // Arrange
    const EXPECTED_RESULTS = 'debio-api-key header is required';
    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS, // eslint-disable-line
      status: (code: number) => RESPONSE, // eslint-disable-line
    } as Response;
    const genetic_analysis_order_id = 'XX'

    // Assert
    expect(
      await substrateControllerMock.geneticAnalysisOrderPaid(genetic_analysis_order_id, RESPONSE, 'NOT API KEY'),
    ).toEqual(EXPECTED_RESULTS);
  });

  it('shoul set genetic analysis order paid', async () => {
    const genetic_analysis_order_id = 'XX';
    const EXPECTED_RESULTS = `set order paid with genetic analysis order id ${genetic_analysis_order_id} on progress`;
    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS, // eslint-disable-line
      status: (code: number) => RESPONSE, // eslint-disable-line
    } as Response;
    (setGeneticAnalysisOrderPaid as jest.Mock).mockReturnValue(undefined);

    expect(
      await substrateControllerMock.geneticAnalysisOrderPaid(genetic_analysis_order_id, RESPONSE, DEBIO_API_KEY),
    ).resolves.toEqual(EXPECTED_RESULTS);
    expect(setGeneticAnalysisOrderPaid).toHaveBeenCalled()
    expect(setGeneticAnalysisOrderPaid).toHaveBeenCalledWith(
      'API',
      'PAIR',
      genetic_analysis_order_id
    );
  });
});
