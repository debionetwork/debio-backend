import { Test, TestingModule } from '@nestjs/testing';
import {
  dateTimeProxyMockFactory,
  MockType,
  transactionLoggingServiceMockFactory,
} from '../../../../../mock';
import {
  DateTimeProxy,
  RequestStatus,
  TransactionLoggingService,
} from '../../../../../../../src/common';
import { ServiceRequestUnstakedHandler } from '../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-unstaked/service-request-unstaked.handler';
import { BlockMetaData } from '../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model';
import { ServiceRequestUnstakedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/service-request';
import * as rewardCommand from '../../../../../../../src/common/polkadot-provider/command/rewards';
import { when } from 'jest-when';
import { TransactionLoggingDto } from '../../../../../../../src/common/modules/transaction-logging/dto/transaction-logging.dto';

describe('Service Request Unstaked Handler Event', () => {
  let serviceRequesUnstakedHandler: ServiceRequestUnstakedHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let dateTimeProxyMock: MockType<DateTimeProxy>;

  const createMockRequest = (requestStatus: RequestStatus) => {
    return [
      {},
      {
        toHuman: jest.fn(() => ({
          hash: 'string',
          requesterAddress: 'string',
          labAddress: 'string',
          country: 'XX',
          region: 'XX',
          city: 'XX',
          serviceCategory: 'Test',
          stakingAmount: '1000000000000',
          status: requestStatus,
          createdAt: '1',
          updatedAt: '1',
          unstakedAt: '1',
        })),
      },
    ];
  };

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: 'string',
      blockNumber: 1,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: DateTimeProxy, useFactory: dateTimeProxyMockFactory },
        {
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory,
        },
        ServiceRequestUnstakedHandler,
      ],
    }).compile();

    serviceRequesUnstakedHandler = module.get(ServiceRequestUnstakedHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    dateTimeProxyMock = module.get(DateTimeProxy);
  });

  it('ServiceRequestUnstakedHandler must defined', () => {
    expect(serviceRequesUnstakedHandler).toBeDefined();
  });

  it('should not called transactionLoggingServiceMock.create if status true', async () => {
    const convertToDbioUnitSpy = jest.spyOn(rewardCommand, 'convertToDbioUnit');
    const requestData = createMockRequest(RequestStatus.Unstaked);

    const TRANSACTION_SERVICE_RETURN = {
      id: '1',
    };

    const STATUS_RETURN = true;

    const serviceRequestUnstakedCommand: ServiceRequestUnstakedCommand =
      new ServiceRequestUnstakedCommand(requestData, mockBlockNumber());

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(serviceRequestUnstakedCommand.request.hash, 8)
      .mockReturnValue(STATUS_RETURN);

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(serviceRequestUnstakedCommand.request.hash)
      .mockReturnValue(TRANSACTION_SERVICE_RETURN);

    await serviceRequesUnstakedHandler.execute(serviceRequestUnstakedCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByOrderId,
    ).toHaveBeenCalled();
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(convertToDbioUnitSpy).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();

    convertToDbioUnitSpy.mockClear();
  });

  it('should called transactionLoggingServiceMock.create if status false', async () => {
    const CURRENT_DATE = new Date();

    const convertToDbioUnitSpy = jest.spyOn(rewardCommand, 'convertToDbioUnit');
    const requestData = createMockRequest(RequestStatus.Unstaked);

    const TRANSACTION_SERVICE_RETURN = {
      id: '1',
    };

    const STATUS_RETURN = false;

    const CONVERT_RETURN = 1000000000000;

    dateTimeProxyMock.new.mockReturnValue(CURRENT_DATE);

    const serviceRequestUnstakedCommand: ServiceRequestUnstakedCommand =
      new ServiceRequestUnstakedCommand(requestData, mockBlockNumber());

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(serviceRequestUnstakedCommand.request.hash, 8)
      .mockReturnValue(STATUS_RETURN);

    when(convertToDbioUnitSpy)
      .calledWith(serviceRequestUnstakedCommand.request.staking_amount)
      .mockReturnValue(CONVERT_RETURN);

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(serviceRequestUnstakedCommand.request.hash)
      .mockReturnValue(TRANSACTION_SERVICE_RETURN);

    const STAKING_LOGGIN_CALLED_WITH: TransactionLoggingDto = {
      address: serviceRequestUnstakedCommand.request.requester_address,
      amount: CONVERT_RETURN,
      created_at: CURRENT_DATE,
      currency: 'DBIO',
      parent_id: BigInt(TRANSACTION_SERVICE_RETURN.id),
      ref_number: serviceRequestUnstakedCommand.request.hash,
      transaction_status: 8,
      transaction_type: 2,
    };

    await serviceRequesUnstakedHandler.execute(serviceRequestUnstakedCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByOrderId,
    ).toHaveBeenCalled();
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(convertToDbioUnitSpy).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalledWith(
      STAKING_LOGGIN_CALLED_WITH,
    );

    convertToDbioUnitSpy.mockClear();
  });
});
