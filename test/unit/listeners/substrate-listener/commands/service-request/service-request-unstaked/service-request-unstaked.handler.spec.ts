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

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(requestData[1].toHuman().hash)
      .mockReturnValue(TRANSACTION_SERVICE_RETURN);

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(requestData[1].toHuman().hash, 8)
      .mockReturnValue(STATUS_RETURN);

    const serviceRequestUnstakedCommand: ServiceRequestUnstakedCommand =
      new ServiceRequestUnstakedCommand(requestData, mockBlockNumber());
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

    const CONVERT_RETURN = 1;

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(requestData[1].toHuman().hash)
      .mockReturnValue(TRANSACTION_SERVICE_RETURN);

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(requestData[1].toHuman().hash, 8)
      .mockReturnValue(STATUS_RETURN);

    when(convertToDbioUnitSpy)
      .calledWith(requestData[1].toHuman().stakingAmount)
      .mockReturnValue(CONVERT_RETURN);

    dateTimeProxyMock.new.mockReturnValue(CURRENT_DATE);

    const STAKING_LOGGIN_CALLED_WITH: TransactionLoggingDto = {
      address: requestData[1].toHuman().requesterAddress,
      amount: CONVERT_RETURN,
      created_at: CURRENT_DATE,
      currency: 'DBIO',
      parent_id: BigInt(TRANSACTION_SERVICE_RETURN.id),
      ref_number: requestData[1].toHuman().hash,
      transaction_status: 8,
      transaction_type: 2,
    };

    const serviceRequestUnstakedCommand: ServiceRequestUnstakedCommand =
      new ServiceRequestUnstakedCommand(requestData, mockBlockNumber());
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
