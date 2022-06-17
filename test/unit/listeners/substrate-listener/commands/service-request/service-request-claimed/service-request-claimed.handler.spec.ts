import { Test, TestingModule } from '@nestjs/testing';
import {
  countryServiceMockFactory,
  mailerManagerMockFactory,
  MockType,
  stateServiceMockFactory,
  transactionLoggingServiceMockFactory,
  notificationServiceMockFactory,
  dateTimeProxyMockFactory,
} from '../../../../../mock';
import {
  MailerManager,
  ProcessEnvProxy,
  TransactionLoggingService,
  DateTimeProxy,
} from '../../../../../../../src/common';
import { RequestStatus } from '@debionetwork/polkadot-provider';
import { CountryService } from '../../../../../../../src/endpoints/location/country.service';
import { StateService } from '../../../../../../../src/endpoints/location/state.service';
import { NotificationService } from '../../../../../../../src/common/modules/notification/notification.service';
import { BlockMetaData } from '../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model';
import { when } from 'jest-when';
import { ServiceRequestClaimedCommandHandler } from '../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-claimed/service-request-claimed.handler';
import { ServiceRequestClaimedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/service-request';

describe('Service Request Created Handler Event', () => {
  let serviceRequesClaimedHandler: ServiceRequestClaimedCommandHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let countryServiceMock: MockType<CountryService>;
  let stateServiceMock: MockType<StateService>;
  let mailerManagerMock: MockType<MailerManager>;
  let notificationServiceMock: MockType<NotificationService>;
  let dateTimeProxyMock: MockType<DateTimeProxy>;

  const createMockRequest = (requestStatus: RequestStatus) => {
    return [
      {},
      {
        toHuman: jest.fn(() => ({
          hash_: 'string',
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
        {
          provide: NotificationService,
          useFactory: notificationServiceMockFactory,
        },
        {
          provide: DateTimeProxy,
          useFactory: dateTimeProxyMockFactory,
        },
        ServiceRequestClaimedCommandHandler,
      ],
    }).compile();

    serviceRequesClaimedHandler = module.get(
      ServiceRequestClaimedCommandHandler,
    );
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    countryServiceMock = module.get(CountryService); // eslint-disable-line
    stateServiceMock = module.get(StateService); // eslint-disable-line
    mailerManagerMock = module.get(MailerManager); // eslint-disable-line
    notificationServiceMock = module.get(NotificationService);
    dateTimeProxyMock = module.get(DateTimeProxy); // eslint-disable-line
  });

  it('ServiceRequesCreatedHandler must defined', () => {
    expect(serviceRequesClaimedHandler).toBeDefined();
  });

  it('should called notificaiton service insert', async () => {
    // Assert
    const TRANSACTION_STATUS = false;
    const requestData = createMockRequest(RequestStatus.Open);

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(requestData[1].toHuman().hash_, 7)
      .mockReturnValue(TRANSACTION_STATUS);

    const serviceRequestClaimedCommand: ServiceRequestClaimedCommand =
      new ServiceRequestClaimedCommand(requestData, mockBlockNumber());

    await serviceRequesClaimedHandler.execute(serviceRequestClaimedCommand);
    expect(notificationServiceMock.insert).toHaveBeenCalled();
    expect(notificationServiceMock.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'Customer',
        entity_type: 'Request Service Staking',
        entity: 'Requested Service Available',
        description: `Congrats! Your requested service is available now. Click here to see your order details.`,
        read: false,
        deleted_at: null,
        from: 'Debio Network',
        to: requestData[1].toHuman().requesterAddress,
      }),
    );
  });
});
