import { Test, TestingModule } from '@nestjs/testing';
import {
  MailerManager,
  ProcessEnvProxy,
  SubstrateService,
} from '../../../../../../../src/common';
import {
  ServiceFlow,
  ServiceInfo,
} from "@debionetwork/polkadot-provider";
import { ServiceCreatedHandler } from '../../../../../../../src/listeners/substrate-listener/commands/services/service-created/service-created.handler';
import {
  mailerManagerMockFactory,
  MockType,
  substrateServiceMockFactory,
} from '../../../../../mock';
import * as labQuery from '@debionetwork/polkadot-provider/lib/query/labs';
import { when } from 'jest-when';

describe('Service Created Handler Event', () => {
  let serviceCreatedHandle: ServiceCreatedHandler;
  let substrateServiceMock: MockType<SubstrateService>;
  let mailerManagerMock: MockType<MailerManager>;

  const createMockService = (
    serviceInfo: ServiceInfo,
    serviceFlow: ServiceFlow,
  ) => {
    return [
      {},
      {
        toHuman: jest.fn(() => ({
          id: 'string',
          owner_id: 'string',
          currency: 'string',
          price: 'string',
          qc_price: 'string',
          info: serviceInfo,
          service_flow: serviceFlow,
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
        ServiceCreatedHandler,
      ],
    }).compile();

    serviceCreatedHandle = module.get(ServiceCreatedHandler);
    substrateServiceMock = module.get(SubstrateService);
    mailerManagerMock = module.get(MailerManager); // eslint-disable-line
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
      pricesByCurrency: [],
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

    when(labSpy)
      .calledWith(substrateServiceMock.api, serviceData['owner_id'])
      .mockReturnValue({ order_id: 1 });
  });
});
