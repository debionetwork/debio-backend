import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { Test, TestingModule } from "@nestjs/testing";
import { substrateServiceMockFactory } from "../../../../../mock";
import { SubstrateService } from "../../../../../../../src/common";
import { ServiceRequestProcessedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-processed/service-request-processed.handler";
import { ServiceRequestProcessedCommand } from "../../../../../../../src/listeners/substrate-listener/commands/service-request";
import { BlockMetaData } from "../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model";

describe('Service Request Processed Command Event', () => {
  let serviceRequesProcessedHandler: ServiceRequestProcessedHandler;
  let commandBus: CommandBus;

  const createMockServiceInvoice = () => {
    return [
      {},
      {
        toHuman: jest.fn(
          () => ({
            requestHash: "",
            orderId: "",
            serviceId: "",
            customerAddress: "",
            sellerAddress: "",
            dnaSampleTrackingId: "",
            testingPrice: "",
            qcPrice: "",
            payAmount: ""
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CqrsModule
      ],
      providers: [
        CommandBus,
				{
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory
				},
        ServiceRequestProcessedHandler
      ]
    }).compile();

    commandBus = module.get(CommandBus);
    serviceRequesProcessedHandler = module.get(ServiceRequestProcessedHandler);
    
		await module.init();
  });

  it('ServiceRequestProcessedHandler must defined', () => {
    expect(serviceRequesProcessedHandler).toBeDefined();
  });

  it('should called ServiceRequesProcessedHandler from command bus', async () => {
    const requestData = createMockServiceInvoice();

    const createServiceRequestHandlerSpy = jest.spyOn(serviceRequesProcessedHandler, 'execute').mockImplementation();

    const serviceRequestCreatedCommand: ServiceRequestProcessedCommand = new ServiceRequestProcessedCommand(requestData, mockBlockNumber());
    await commandBus.execute(serviceRequestCreatedCommand);
    expect(createServiceRequestHandlerSpy).toBeCalled();
    expect(createServiceRequestHandlerSpy).toBeCalledWith(serviceRequestCreatedCommand);

    createServiceRequestHandlerSpy.mockClear();
  });
});