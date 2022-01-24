import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { OrderStatus, TransactionLoggingService } from "../../../../../../../src/common";
import { OrderCreatedCommand } from "../../../../../../../src/listeners/substrate-listener/commands/orders";
import { Test, TestingModule } from "@nestjs/testing";
import { createMockOrder, mockBlockNumber, transactionLoggingServiceMockFactory } from "../../../../../mock";
import { OrderCreatedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/orders/order-created/order-created.handler";

describe("Order Created Command Event", () => {
  let orderCreatedHandler: OrderCreatedHandler;
  let commandBus: CommandBus;

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
        OrderCreatedHandler
      ]
    }).compile();

    orderCreatedHandler = module.get(OrderCreatedHandler);
    commandBus = module.get(CommandBus);

    await module.init();
  });

  it("should defined Order Created Handler", () => {
    expect(orderCreatedHandler).toBeDefined();
  });

  it("should called order created handler with command bus", async () => {
    const ORDER = createMockOrder(OrderStatus.Unpaid);

    const orderCreatedHandlerSpy = jest.spyOn(orderCreatedHandler, 'execute').mockImplementation();

    const orderCreatedCommand: OrderCreatedCommand = new OrderCreatedCommand([ORDER], mockBlockNumber());

    await commandBus.execute(orderCreatedCommand);
    expect(orderCreatedHandlerSpy).toHaveBeenCalled();
    expect(orderCreatedHandlerSpy).toHaveBeenCalledWith(orderCreatedCommand);

    orderCreatedHandlerSpy.mockClear();
  });
});