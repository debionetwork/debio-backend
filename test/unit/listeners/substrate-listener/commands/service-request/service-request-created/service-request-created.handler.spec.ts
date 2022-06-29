import { Test, TestingModule } from '@nestjs/testing';
import {
  countryServiceMockFactory,
  mailerManagerMockFactory,
  MockType,
  stateServiceMockFactory,
  transactionLoggingServiceMockFactory,
  notificationServiceMockFactory,
  dateTimeProxyMockFactory,
  googleSecretManagerServiceMockFactory,
} from '../../../../../mock';
import {
  MailerManager,
  ProcessEnvProxy,
  TransactionLoggingService,
  DateTimeProxy,
} from '../../../../../../../src/common';
import { RequestStatus } from '@debionetwork/polkadot-provider';
import { ServiceRequestCreatedHandler } from '../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-created/service-request-created.handler';
import { CountryService } from '../../../../../../../src/endpoints/location/country.service';
import { StateService } from '../../../../../../../src/endpoints/location/state.service';
import { NotificationService } from '../../../../../../../src/common/modules/notification/notification.service';
import { BlockMetaData } from '../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model';
import { ServiceRequestCreatedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/service-request';
import { when } from 'jest-when';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';

describe('Service Request Created Handler Event', () => {
  let serviceRequesCreatedHandler: ServiceRequestCreatedHandler;
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
        {
          provide: GCloudSecretManagerService,
          useFactory: googleSecretManagerServiceMockFactory,
        },
        ServiceRequestCreatedHandler,
      ],
    }).compile();

    serviceRequesCreatedHandler = module.get(ServiceRequestCreatedHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    countryServiceMock = module.get(CountryService); // eslint-disable-line
    stateServiceMock = module.get(StateService); // eslint-disable-line
    mailerManagerMock = module.get(MailerManager); // eslint-disable-line
    notificationServiceMock = module.get(NotificationService);
    dateTimeProxyMock = module.get(DateTimeProxy); // eslint-disable-line
  });

  it('ServiceRequesCreatedHandler must defined', () => {
    expect(serviceRequesCreatedHandler).toBeDefined();
  });

  it('should not called transactionLoggingServiceMock create if status true', async () => {
    // Assert
    const TRANSACTION_STATUS = true;
    const requestData = createMockRequest(RequestStatus.Open);

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(requestData[1].toHuman().hash_, 7)
      .mockReturnValue(TRANSACTION_STATUS);

    const serviceRequestCreatedCommand: ServiceRequestCreatedCommand =
      new ServiceRequestCreatedCommand(requestData, mockBlockNumber());
    await serviceRequesCreatedHandler.execute(serviceRequestCreatedCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
    expect(notificationServiceMock.insert).toHaveBeenCalled();
  });

  it('should called transactionLoggingServiceMock create if status false', async () => {
    // Assert
    const TRANSACTION_STATUS = false;
    const requestData = createMockRequest(RequestStatus.Open);

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(requestData[1].toHuman().hash_, 7)
      .mockReturnValue(TRANSACTION_STATUS);

    const spyEmail = jest
      .spyOn(
        serviceRequesCreatedHandler,
        '_sendEmailNotificationServiceRequestCreated',
      )
      .mockImplementation();

    const serviceRequestCreatedCommand: ServiceRequestCreatedCommand =
      new ServiceRequestCreatedCommand(requestData, mockBlockNumber());

    await serviceRequesCreatedHandler.execute(serviceRequestCreatedCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
    expect(spyEmail).toHaveBeenCalled();
    expect(notificationServiceMock.insert).toHaveBeenCalled();
  });
});
