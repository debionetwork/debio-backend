import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { OrderStatus, TransactionLoggingService } from "../../../../../../../src/common";
import { OrderRefundedCommand } from "../../../../../../../src/listeners/substrate-listener/commands/orders";
import { Test, TestingModule } from "@nestjs/testing";
import { createMockOrder, mockBlockNumber, transactionLoggingServiceMockFactory } from "../../../../../mock";
import { OrderRefundedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/orders/order-refunded/order-refunded.handler";

describe("Order Paid Command Event", () => {
  let orderRefundedHandler: OrderRefundedHandler;
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
        OrderRefundedHandler
      ]
    }).compile();

    orderRefundedHandler = module.get(OrderRefundedHandler);
    commandBus = module.get(CommandBus);

    await module.init();
  });

  it("should defined Order Paid Handler", () => {
    expect(orderRefundedHandler).toBeDefined();
  });

  it("should called order paid handler with command bus", async () => {
    const ORDER = createMockOrder(OrderStatus.Unpaid);

    const orderRefundedHandlerSpy = jest.spyOn(orderRefundedHandler, 'execute').mockImplementation();

    const orderRefundedCommand: OrderRefundedCommand = new OrderRefundedCommand([ORDER], mockBlockNumber());

    await commandBus.execute(orderRefundedCommand);
    expect(orderRefundedHandlerSpy).toHaveBeenCalled();
    expect(orderRefundedHandlerSpy).toHaveBeenCalledWith(orderRefundedCommand);

    orderRefundedHandlerSpy.mockClear();
  });
});