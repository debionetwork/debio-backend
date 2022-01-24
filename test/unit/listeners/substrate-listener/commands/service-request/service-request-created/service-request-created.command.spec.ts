import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { Test, TestingModule } from "@nestjs/testing";
import { countryServiceMockFactory, mailerManagerMockFactory, stateServiceMockFactory, transactionLoggingServiceMockFactory } from "../../../../../mock";
import { MailerManager, ProcessEnvProxy, RequestStatus, TransactionLoggingService } from "../../../../../../../src/common";
import { ServiceRequestCreatedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-created/service-request-created.handler";
import { CountryService } from "../../../../../../../src/endpoints/location/country.service";
import { StateService } from "../../../../../../../src/endpoints/location/state.service";
import { ServiceRequestCreatedCommand } from "../../../../../../../src/listeners/substrate-listener/commands/service-request";
import { BlockMetaData } from "../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model";

describe('Service Request Created Command Event', () => {
  let serviceRequesCreatedHandler: ServiceRequestCreatedHandler;
  let commandBus: CommandBus;

  const createMockRequest = (requestStatus: RequestStatus) => {
    return [
      {},
      {
        toHuman: jest.fn(
          () => ({
            hash_: "string",
            requesterAddress: "string",
            labAddress: "string",
            country: "XX",
            region: "XX",
            city: "XX",
            serviceCategory: "Test",
            stakingAmount: "1000000000000",
            status: requestStatus,
            createdAt: "1",
            updatedAt: "1",
            unstakedAt: "1"
          })
        )
      }
    ]
  }

	function mockBlockNumber(): BlockMetaData {
		return {
			blockHash: "string",
			blockNumber: 1,
		}
	}

  const EMAILS = "email";
  
  class ProcessEnvProxyMock {
    env = { EMAILS };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CqrsModule
      ],
      providers: [
        CommandBus,
        { provide: ProcessEnvProxy, useClass: ProcessEnvProxyMock },
				{
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory
				},
        {
          provide: CountryService,
          useFactory: countryServiceMockFactory
        },
        {
          provide: StateService,
          useFactory: stateServiceMockFactory
        },
        {
          provide: MailerManager,
          useFactory: mailerManagerMockFactory
        },
        ServiceRequestCreatedHandler
      ]
    }).compile();

    commandBus = module.get(CommandBus);
    serviceRequesCreatedHandler = module.get(ServiceRequestCreatedHandler);
    
		await module.init();
  });

  it('ServiceRequesCreatedHandler must defined', () => {
    expect(serviceRequesCreatedHandler).toBeDefined();
  });

  it('should called ServiceRequesCreatedHandler from command bus', async () => {
    const requestData = createMockRequest(RequestStatus.Open);

    const serviceRequesCreatedHandlerSpy = jest.spyOn(serviceRequesCreatedHandler, 'execute').mockImplementation();

    const serviceRequestCreatedCommand: ServiceRequestCreatedCommand = new ServiceRequestCreatedCommand(requestData, mockBlockNumber());
    await commandBus.execute(serviceRequestCreatedCommand);
    expect(serviceRequesCreatedHandlerSpy).toBeCalled();
    expect(serviceRequesCreatedHandlerSpy).toBeCalledWith(serviceRequestCreatedCommand);

    serviceRequesCreatedHandlerSpy.mockClear();
  });
});