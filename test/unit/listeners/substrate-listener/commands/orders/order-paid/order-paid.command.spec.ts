import { OrderStatus } from '../../../../../../../src/common';
import { OrderPaidCommand } from '../../../../../../../src/listeners/substrate-listener/commands/orders';
import { createMockOrder, mockBlockNumber } from '../../../../../mock';
import { Order } from '../../../../../../../src/common/polkadot-provider/models/orders';

jest.mock('../../../../../../../src/common/polkadot-provider/models/orders');

describe('Order Cancelled Command Event', () => {
  it('should called model data and toHuman', () => {
    const ORDER_RESPONSE = createMockOrder(OrderStatus.Cancelled);

    const _ = // eslint-disable-line
      new OrderPaidCommand([ORDER_RESPONSE], mockBlockNumber());
    expect(Order).toHaveBeenCalled();
    expect(Order).toHaveBeenCalledWith(ORDER_RESPONSE.toHuman());
    expect(ORDER_RESPONSE.toHuman).toHaveBeenCalled();
  });

  it('should throw error if toHuman not defined', () => {
    expect(() => {
      const _ = // eslint-disable-line
        new OrderPaidCommand([{}], mockBlockNumber());
    }).toThrowError();
  });
});
