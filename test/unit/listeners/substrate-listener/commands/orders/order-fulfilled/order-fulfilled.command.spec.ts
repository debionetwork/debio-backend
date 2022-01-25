import { OrderStatus } from "../../../../../../../src/common";
import { OrderFulfilledCommand } from "../../../../../../../src/listeners/substrate-listener/commands/orders";
import { createMockOrder, mockBlockNumber } from "../../../../../mock";
import { Order } from "../../../../../../../src/common/polkadot-provider/models/orders";

jest.mock("../../../../../../../src/common/polkadot-provider/models/orders");

describe("Order Cancelled Command Event", () => {
  it("should called model data and toHuman", () => {
    const ORDER_RESPONSE = createMockOrder(OrderStatus.Cancelled);

    const _orderFulfilledCommand: OrderFulfilledCommand = new OrderFulfilledCommand([ORDER_RESPONSE], mockBlockNumber());
    expect(Order).toHaveBeenCalled();
    expect(Order).toHaveBeenCalledWith(ORDER_RESPONSE.toHuman())
    expect(ORDER_RESPONSE.toHuman).toHaveBeenCalled();
  });
  
  it("should throw error if toHuman not defined", () => {
    expect(
      () => {
        const _orderFulfilledCommand: OrderFulfilledCommand = new OrderFulfilledCommand([{}], mockBlockNumber()); 
      }
    ).toThrowError();
  })
});