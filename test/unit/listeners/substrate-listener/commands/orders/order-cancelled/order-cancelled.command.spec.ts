import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { OrderStatus, TransactionLoggingService } from "../../../../../../../src/common";
import { OrderCancelledCommand } from "../../../../../../../src/listeners/substrate-listener/commands/orders";
import { Test, TestingModule } from "@nestjs/testing";
import { escrowServiceMockFactory, transactionLoggingServiceMockFactory, createMockOrder, mockBlockNumber } from "../../../../../mock";
import { OrderCancelledHandler } from "../../../../../../../src/listeners/substrate-listener/commands/orders/order-cancelled/order-cancelled.handler";
import { EscrowService } from "../../../../../../../src/endpoints/escrow/escrow.service";

describe("Order Cancelled Command Event", () => {
  let orderCancelledHandler: OrderCancelledHandler;
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
				{
          provide: EscrowService,
          useFactory: escrowServiceMockFactory
				},
        OrderCancelledHandler
      ]
    }).compile();

    orderCancelledHandler = module.get(OrderCancelledHandler);
    commandBus = module.get(CommandBus);

    await module.init();
  });

  it("should defined Order Cancelled Handler", () => {
    expect(orderCancelledHandler).toBeDefined();
  });

  it("should called order cancelled handler with command bus", async () => {
    const ORDER = createMockOrder(OrderStatus.Cancelled);

    const orderCancelledHandlerSpy = jest.spyOn(orderCancelledHandler, 'execute').mockImplementation();

    const orderCancelledCommand: OrderCancelledCommand = new OrderCancelledCommand([ORDER], mockBlockNumber());

    await commandBus.execute(orderCancelledCommand);
    expect(orderCancelledHandlerSpy).toHaveBeenCalled();
    expect(orderCancelledHandlerSpy).toHaveBeenCalledWith(orderCancelledCommand);

    orderCancelledHandlerSpy.mockClear();
  });
});