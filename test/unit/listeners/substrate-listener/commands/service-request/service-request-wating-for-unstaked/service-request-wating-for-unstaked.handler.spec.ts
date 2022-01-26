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
import { ServiceRequestWaitingForUnstakedHandler } from '../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-waiting-for-unstaked/service-request-waiting-for-unstaked.handler';
import { BlockMetaData } from '../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model';
import { ServiceRequestWaitingForUnstakedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/service-request';
import { when } from 'jest-when';
import { TransactionLoggingDto } from '../../../../../../../src/common/modules/transaction-logging/dto/transaction-logging.dto';

describe('Service Request Waiting For Unstaked Handler Event', () => {
  let serviceRequesWaitingForUnstakedHandler: ServiceRequestWaitingForUnstakedHandler;
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
        ServiceRequestWaitingForUnstakedHandler,
      ],
    }).compile();

    serviceRequesWaitingForUnstakedHandler = module.get(
      ServiceRequestWaitingForUnstakedHandler,
    );
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    dateTimeProxyMock = module.get(DateTimeProxy);
  });

  it('ServiceRequestWaitingForUnstakedHandler must defined', () => {
    expect(serviceRequesWaitingForUnstakedHandler).toBeDefined();
  });

  it('should not called transactionLoggingServiceMock.create if status true', async () => {
    const requestData = createMockRequest(RequestStatus.Unstaked);

    const TRANSACTION_SERVICE_RETURN = {
      id: '1',
    };

    const STATUS_RETURN = true;

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(requestData[1].toHuman().hash)
      .mockReturnValue(TRANSACTION_SERVICE_RETURN);

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(requestData[1].toHuman().hash, 11)
      .mockReturnValue(STATUS_RETURN);

    const serviceRequestWaitingForUnstakedCommand: ServiceRequestWaitingForUnstakedCommand =
      new ServiceRequestWaitingForUnstakedCommand(
        requestData,
        mockBlockNumber(),
      );
    await serviceRequesWaitingForUnstakedHandler.execute(
      serviceRequestWaitingForUnstakedCommand,
    );
    expect(
      transactionLoggingServiceMock.getLoggingByOrderId,
    ).toHaveBeenCalled();
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
  });

  it('should called transactionLoggingServiceMock.create if status false', async () => {
    const CURRENT_DATE = new Date();

    const requestData = createMockRequest(RequestStatus.Unstaked);

    const TRANSACTION_SERVICE_RETURN = {
      id: '1',
    };

    const STATUS_RETURN = false;

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(requestData[1].toHuman().hash)
      .mockReturnValue(TRANSACTION_SERVICE_RETURN);

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(requestData[1].toHuman().hash, 11)
      .mockReturnValue(STATUS_RETURN);

    dateTimeProxyMock.new.mockReturnValue(CURRENT_DATE);
    
    const STAKING_LOGGIN_CALLED_WITH: TransactionLoggingDto = {
      address: requestData[1].toHuman().requesterAddress,
      amount: 0,
      created_at: CURRENT_DATE,
      currency: 'DBIO',
      parent_id: BigInt(TRANSACTION_SERVICE_RETURN.id),
      ref_number: requestData[1].toHuman().hash,
      transaction_status: 11,
      transaction_type: 2,
    };

    const serviceRequestWaitingForUnstakedCommand: ServiceRequestWaitingForUnstakedCommand =
      new ServiceRequestWaitingForUnstakedCommand(
        requestData,
        mockBlockNumber(),
      );
    await serviceRequesWaitingForUnstakedHandler.execute(
      serviceRequestWaitingForUnstakedCommand,
    );
    expect(
      transactionLoggingServiceMock.getLoggingByOrderId,
    ).toHaveBeenCalled();
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalledWith(
      STAKING_LOGGIN_CALLED_WITH,
    );
  });
});
