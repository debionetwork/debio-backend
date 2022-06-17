import { Test, TestingModule } from '@nestjs/testing';
import {
  DateTimeProxy,
  MailerManager,
  ProcessEnvProxy,
  SubstrateService,
} from '../../../../../../../src/common';
import { ServiceFlow, ServiceInfo } from '@debionetwork/polkadot-provider';
import { ServiceCreatedHandler } from '../../../../../../../src/listeners/substrate-listener/commands/services/service-created/service-created.handler';
import {
  dateTimeProxyMockFactory,
  mailerManagerMockFactory,
  mockBlockNumber,
  MockType,
  notificationServiceMockFactory,
  substrateServiceMockFactory,
} from '../../../../../mock';
import * as labQuery from '@debionetwork/polkadot-provider/lib/query/labs';
import { when } from 'jest-when';
import { NotificationService } from '../../../../../../../src/common/modules/notification/notification.service';
import { ServiceCreatedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/services';

describe('Service Created Handler Event', () => {
  let serviceCreatedHandle: ServiceCreatedHandler;
  let substrateServiceMock: MockType<SubstrateService>;
  let notificationServiceMock: MockType<NotificationService>;
  let mailerManagerMock: MockType<MailerManager>;

  const createMockService = (
    serviceInfo: ServiceInfo,
    serviceFlow: ServiceFlow,
  ) => {
    return [
      {
        toHuman: jest.fn(() => ({
          id: 'string',
          ownerId: 'string',
          currency: 'string',
          price: 'string',
          qcPrice: 'string',
          info: serviceInfo,
          serviceFlow: serviceFlow,
        })),
      },
    ];
  };

  const EMAILS = 'email';
  class ProcessEnvProxyMock {
    env = { EMAILS };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ProcessEnvProxy, useClass: ProcessEnvProxyMock },
        {
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory,
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
        ServiceCreatedHandler,
      ],
    }).compile();

    serviceCreatedHandle = module.get(ServiceCreatedHandler);
    substrateServiceMock = module.get(SubstrateService);
    mailerManagerMock = module.get(MailerManager); // eslint-disable-line
    notificationServiceMock = module.get(NotificationService);
  });

  it('ServiceCreatedHandler must defined', () => {
    expect(serviceCreatedHandle).toBeDefined();
  });

  it('should called service create listener', async () => {
    const labSpy = jest.spyOn(labQuery, 'queryLabById').mockImplementation();

    const serviceInfo = {
      name: 'string',
      category: 'string',
      description: 'string',
      pricesByCurrency: [
        {
          currency: 'string',
          totalPrice: 'string',
          priceComponents: [
            {
              component: 'string',
              value: 'string',
            },
          ],
          additionalPrices: [
            {
              component: 'string',
              value: 'string',
            },
          ],
        },
      ],
      expectedDuration: {
        duration: 'XX',
        durationType: 'XX',
      },
      testResultSample: 'string',
      longDescription: 'string',
      image: 'string',
      dnaCollectionProcess: 'string',
      price: 'string',
    };
    const serviceData = createMockService(serviceInfo, ServiceFlow.RequestTest);

    const service = serviceData[0].toHuman();

    when(labSpy)
      .calledWith(substrateServiceMock.api, service.ownerId)
      .mockReturnValue({ order_id: 1 });

    const serviceCreatedCommand: ServiceCreatedCommand =
      new ServiceCreatedCommand(serviceData, mockBlockNumber());
    await serviceCreatedHandle.execute(serviceCreatedCommand);

    expect(notificationServiceMock.insert).toHaveBeenCalled();
    expect(notificationServiceMock.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'Lab',
        entity_type: 'Lab',
        entity: 'Add service',
        description: `You've successfully added your new service - ${service.info.name}.`,
        read: false,
        deleted_at: null,
        from: 'Debio Network',
        to: service.ownerId,
      }),
    );
  });
});
