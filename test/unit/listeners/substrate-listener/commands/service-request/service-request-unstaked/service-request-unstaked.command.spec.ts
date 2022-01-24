import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { Test, TestingModule } from "@nestjs/testing";
import { transactionLoggingServiceMockFactory } from "../../../../../mock";
import { RequestStatus, TransactionLoggingService } from "../../../../../../../src/common";
import { ServiceRequestUnstakedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-unstaked/service-request-unstaked.handler";
import { ServiceRequestUnstakedCommand } from "../../../../../../../src/listeners/substrate-listener/commands/service-request";
import { BlockMetaData } from "../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model";

describe('Service Request Unstaked Command Event', () => {
  let serviceRequesUnstakedHandler: ServiceRequestUnstakedHandler;
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CqrsModule
      ],
      providers: [
        CommandBus,
				{
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory
				},
        ServiceRequestUnstakedHandler
      ]
    }).compile();

    commandBus = module.get(CommandBus);
    serviceRequesUnstakedHandler = module.get(ServiceRequestUnstakedHandler);
    
		await module.init();
  });

  it('ServiceRequestUnstakedHandler must defined', () => {
    expect(serviceRequesUnstakedHandler).toBeDefined();
  });

  it('should called ServiceRequestUnstakedHandler from command bus', async () => {
    const requestData = createMockRequest(RequestStatus.Unstaked);

    const serviceRequesUnstakedHandlerSpy = jest.spyOn(serviceRequesUnstakedHandler, 'execute').mockImplementation();

    const serviceRequestUnstakedCommand: ServiceRequestUnstakedCommand = new ServiceRequestUnstakedCommand(requestData, mockBlockNumber());
    await commandBus.execute(serviceRequestUnstakedCommand);
    expect(serviceRequesUnstakedHandlerSpy).toBeCalled();
    expect(serviceRequesUnstakedHandlerSpy).toBeCalledWith(serviceRequestUnstakedCommand);

    serviceRequesUnstakedHandlerSpy.mockClear();
  });
});