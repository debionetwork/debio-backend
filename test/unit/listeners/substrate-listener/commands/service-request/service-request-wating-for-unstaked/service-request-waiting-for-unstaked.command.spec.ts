import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { Test, TestingModule } from "@nestjs/testing";
import { transactionLoggingServiceMockFactory } from "../../../../../mock";
import { RequestStatus, TransactionLoggingService } from "../../../../../../../src/common";
import { ServiceRequestWaitingForUnstakedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-waiting-for-unstaked/service-request-waiting-for-unstaked.handler";
import { ServiceRequestWaitingForUnstakedCommand } from "../../../../../../../src/listeners/substrate-listener/commands/service-request";
import { BlockMetaData } from "../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model";

describe('Service Request Waiting For Unstaked Command Event', () => {
  let serviceRequestWaitingForUnstakedHandler: ServiceRequestWaitingForUnstakedHandler;
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
        ServiceRequestWaitingForUnstakedHandler
      ]
    }).compile();

    commandBus = module.get(CommandBus);
    serviceRequestWaitingForUnstakedHandler = module.get(ServiceRequestWaitingForUnstakedHandler);
    
		await module.init();
  });

  it('ServiceRequestWaitingForUnstakedHandler must defined', () => {
    expect(serviceRequestWaitingForUnstakedHandler).toBeDefined();
  });

  it('should called ServiceRequestWaitingForUnstakedHandler from command bus', async () => {
    const requestData = createMockRequest(RequestStatus.WaitingForUnstaked);

    const serviceRequestWaitingForUnstakedHandlerSpy = jest.spyOn(serviceRequestWaitingForUnstakedHandler, 'execute').mockImplementation();

    const serviceRequestWaitingForUnstakedCommand: ServiceRequestWaitingForUnstakedCommand = new ServiceRequestWaitingForUnstakedCommand(requestData, mockBlockNumber());
    await commandBus.execute(serviceRequestWaitingForUnstakedCommand);
    expect(serviceRequestWaitingForUnstakedHandlerSpy).toBeCalled();
    expect(serviceRequestWaitingForUnstakedHandlerSpy).toBeCalledWith(serviceRequestWaitingForUnstakedCommand);

    serviceRequestWaitingForUnstakedHandlerSpy.mockClear();
  });
});