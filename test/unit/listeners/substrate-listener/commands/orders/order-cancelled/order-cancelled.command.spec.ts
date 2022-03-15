import { OrderCancelledCommand } from '../../../../../../../src/listeners/substrate-listener/commands/orders';
import { createMockOrder, mockBlockNumber } from '../../../../../mock';
import { Order, OrderStatus } from '@debionetwork/polkadot-provider';

jest.mock('@debionetwork/polkadot-provider');

describe('Order Cancelled Command Event', () => {
  it('should called model data and toHuman', () => {
    const ORDER_RESPONSE = createMockOrder(OrderStatus.Cancelled);

    const _ = new OrderCancelledCommand([ORDER_RESPONSE], mockBlockNumber()); // eslint-disable-line
    expect(Order).toHaveBeenCalled();
    expect(Order).toHaveBeenCalledWith(ORDER_RESPONSE.toHuman());
    expect(ORDER_RESPONSE.toHuman).toHaveBeenCalled();
  });

  it('should throw error if toHuman not defined', () => {
    expect(() => {
      const _ = new OrderCancelledCommand([{}], mockBlockNumber()); // eslint-disable-line
    }).toThrowError();
  });
});
