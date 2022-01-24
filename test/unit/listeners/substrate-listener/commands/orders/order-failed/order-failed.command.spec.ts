import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { OrderStatus, SubstrateService } from "../../../../../../../src/common";
import { OrderFailedCommand } from "../../../../../../../src/listeners/substrate-listener/commands/orders";
import { Test, TestingModule } from "@nestjs/testing";
import { createMockOrder, escrowServiceMockFactory, mockBlockNumber, substrateServiceMockFactory } from "../../../../../mock";
import { OrderFailedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/orders/order-failed/order-failed.handler";
import { EscrowService } from "../../../../../../../src/endpoints/escrow/escrow.service";

describe("Order Failed Command Event", () => {
  let orderFailedHandler: OrderFailedHandler;
  let commandBus: CommandBus;

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
				{
          provide: EscrowService,
          useFactory: escrowServiceMockFactory
				},
        OrderFailedHandler
      ]
    }).compile();

    orderFailedHandler = module.get(OrderFailedHandler);
    commandBus = module.get(CommandBus);

    await module.init();
  });

  it("should defined Order Failed Handler", () => {
    expect(orderFailedHandler).toBeDefined();
  });

  it("should called order failed handler with command bus", async () => {
    const ORDER = createMockOrder(OrderStatus.Unpaid);

    const orderFailedHandlerSpy = jest.spyOn(orderFailedHandler, 'execute').mockImplementation();

    const orderFailedCommand: OrderFailedCommand = new OrderFailedCommand([ORDER], mockBlockNumber());

    await commandBus.execute(orderFailedCommand);
    expect(orderFailedHandlerSpy).toHaveBeenCalled();
    expect(orderFailedHandlerSpy).toHaveBeenCalledWith(orderFailedCommand);

    orderFailedHandlerSpy.mockClear();
  });
});