import { Test, TestingModule } from '@nestjs/testing';
import {
  countryServiceMockFactory,
  mailerManagerMockFactory,
  MockType,
  stateServiceMockFactory,
  transactionLoggingServiceMockFactory,
} from '../../../../../mock';
import {
  MailerManager,
  ProcessEnvProxy,
  RequestStatus,
  TransactionLoggingService,
} from '../../../../../../../src/common';
import { ServiceRequestCreatedHandler } from '../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-created/service-request-created.handler';
import { CountryService } from '../../../../../../../src/endpoints/location/country.service';
import { StateService } from '../../../../../../../src/endpoints/location/state.service';
import { BlockMetaData } from '../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model';
import { ServiceRequestCreatedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/service-request';
import { when } from 'jest-when';
import * as rewardCommand from '../../../../../../../src/common/polkadot-provider/command/rewards';
import { TransactionLoggingDto } from '../../../../../../../src/common/modules/transaction-logging/dto/transaction-logging.dto';

describe('Service Request Created Handler Event', () => {
  let serviceRequesCreatedHandler: ServiceRequestCreatedHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let countryServiceMock: MockType<CountryService>;
  let stateServiceMock: MockType<StateService>;
  let mailerManagerMock: MockType<MailerManager>;

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
          createdAt: new Date(),
          updatedAt: new Date(),
          unstakedAt: new Date(),
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

  const EMAILS = 'email';

  class ProcessEnvProxyMock {
    env = { EMAILS };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ProcessEnvProxy, useClass: ProcessEnvProxyMock },
        {
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory,
        },
        {
          provide: CountryService,
          useFactory: countryServiceMockFactory,
        },
        {
          provide: StateService,
          useFactory: stateServiceMockFactory,
        },
        {
          provide: MailerManager,
          useFactory: mailerManagerMockFactory,
        },
        ServiceRequestCreatedHandler,
      ],
    }).compile();

    serviceRequesCreatedHandler = module.get(ServiceRequestCreatedHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    countryServiceMock = module.get(CountryService);
    stateServiceMock = module.get(StateService);
    mailerManagerMock = module.get(MailerManager);
  });

  it('ServiceRequesCreatedHandler must defined', () => {
    expect(serviceRequesCreatedHandler).toBeDefined();
  });

  it('should not called transactionLoggingServiceMock create if status true', async () => {
    // Assert
    const convertToDbioUnitSpy = jest
      .spyOn(rewardCommand, 'convertToDbioUnit')
      .mockReturnValue(1);
    const TRANSACTION_STATUS = true;
    const requestData = createMockRequest(RequestStatus.Open);

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(requestData[1].toHuman().hash, 7)
      .mockReturnValue(TRANSACTION_STATUS);

    const serviceRequestCreatedCommand: ServiceRequestCreatedCommand =
      new ServiceRequestCreatedCommand(requestData, mockBlockNumber());
    await serviceRequesCreatedHandler.execute(serviceRequestCreatedCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(convertToDbioUnitSpy).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
  });

  it('should called transactionLoggingServiceMock create if status false', async () => {
    // Assert
    const CONVERT_RETURN = 1;
    const convertToDbioUnitSpy = jest.spyOn(rewardCommand, 'convertToDbioUnit');
    const TRANSACTION_STATUS = false;
    const requestData = createMockRequest(RequestStatus.Open);

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(requestData[1].toHuman().hash, 7)
      .mockReturnValue(TRANSACTION_STATUS);

    when(convertToDbioUnitSpy)
      .calledWith(requestData[1].toHuman().stakingAmount)
      .mockReturnValue(CONVERT_RETURN);

    const serviceRequestCreatedCommand: ServiceRequestCreatedCommand =
      new ServiceRequestCreatedCommand(requestData, mockBlockNumber());

    const STAKING_LOGGING_CREATE_CALLED_WITH: TransactionLoggingDto = {
      address: requestData[1].toHuman().requesterAddress,
      amount: CONVERT_RETURN,
      created_at: serviceRequestCreatedCommand.request.created_at,
      currency: 'DBIO',
      parent_id: BigInt(0),
      ref_number: requestData[1].toHuman().hash,
      transaction_status: 7,
      transaction_type: 2,
    };

    await serviceRequesCreatedHandler.execute(serviceRequestCreatedCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(convertToDbioUnitSpy).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalledWith(
      STAKING_LOGGING_CREATE_CALLED_WITH,
    );
  });
});
