import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { OrderStatus, TransactionLoggingService } from "../../../../../../../src/common";
import { OrderPaidCommand } from "../../../../../../../src/listeners/substrate-listener/commands/orders";
import { Test, TestingModule } from "@nestjs/testing";
import { createMockOrder, mockBlockNumber, transactionLoggingServiceMockFactory } from "../../../../../mock";
import { OrderPaidHandler } from "../../../../../../../src/listeners/substrate-listener/commands/orders/order-paid/order-paid.handler";

describe("Order Paid Command Event", () => {
  let orderPaidHandler: OrderPaidHandler;
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
        OrderPaidHandler
      ]
    }).compile();

    orderPaidHandler = module.get(OrderPaidHandler);
    commandBus = module.get(CommandBus);

    await module.init();
  });

  it("should defined Order Paid Handler", () => {
    expect(orderPaidHandler).toBeDefined();
  });

  it("should called order paid handler with command bus", async () => {
    const ORDER = createMockOrder(OrderStatus.Unpaid);

    const orderPaidHandlerSpy = jest.spyOn(orderPaidHandler, 'execute').mockImplementation();

    const orderPaidCommand: OrderPaidCommand = new OrderPaidCommand([ORDER], mockBlockNumber());

    await commandBus.execute(orderPaidCommand);
    expect(orderPaidHandlerSpy).toHaveBeenCalled();
    expect(orderPaidHandlerSpy).toHaveBeenCalledWith(orderPaidCommand);

    orderPaidHandlerSpy.mockClear();
  });
});