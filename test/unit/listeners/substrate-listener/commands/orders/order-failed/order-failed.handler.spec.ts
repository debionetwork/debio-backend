import { OrderStatus, SubstrateService } from "../../../../../../../src/common";
import { OrderCreatedCommand } from "../../../../../../../src/listeners/substrate-listener/commands/orders";
import { Test, TestingModule } from "@nestjs/testing";
import { createMockOrder, escrowServiceMockFactory, mockBlockNumber, MockType, substrateServiceMockFactory } from "../../../../../mock";
import { OrderFailedHandler } from "../../../../../../../src/listeners/substrate-listener/commands/orders/order-failed/order-failed.handler";
import { EscrowService } from "../../../../../../../src/endpoints/escrow/escrow.service";
import { ethers } from 'ethers';

import * as ordersCommand from "../../../../../../../src/common/polkadot-provider/command/orders";

jest.mock('ethers', () => ({
  ethers: {
    utils: {
      toUtf8String: jest.fn(val=>val)
    },
  },
}));

describe("Order Failed Handler Event", () => {
  let orderFailedHandler: OrderFailedHandler;
  let substrateServiceMock: MockType<SubstrateService>;
  let escrowServiceMock: MockType<EscrowService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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
    substrateServiceMock = module.get(SubstrateService);
    escrowServiceMock = module.get(EscrowService);

    await module.init();
  });

  it("should defined Order Failed Handler", () => {
    expect(orderFailedHandler).toBeDefined();
  });

  it("should called refunded order if failed", async () => {
    // Arrange
    const refundedOrderSpy = jest.spyOn(ordersCommand, 'refundOrder').mockImplementation();
    const toUtf8StringSpy = jest.spyOn(ethers.utils, 'toUtf8String');
    const ORDER = createMockOrder(OrderStatus.Cancelled);

    const orderCancelledCommand: OrderCreatedCommand = new OrderCreatedCommand([ORDER], mockBlockNumber());

    await orderFailedHandler.execute(orderCancelledCommand);
    expect(escrowServiceMock.refundOrder).toHaveBeenCalled();
    expect(escrowServiceMock.refundOrder).toHaveBeenCalledWith(orderCancelledCommand.orders.id);
    expect(toUtf8StringSpy).toHaveBeenCalled();
    expect(refundedOrderSpy).toHaveBeenCalled();
    expect(refundedOrderSpy).toHaveBeenCalledWith(substrateServiceMock.api, substrateServiceMock.pair, orderCancelledCommand.orders.id);
  });
});