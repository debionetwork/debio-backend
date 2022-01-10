import { ApiPromise } from '@polkadot/api';
import { Order } from '..';

export async function queryLastOrderHashByCustomer(api: ApiPromise, substrateAddress: string): Promise<string> {
    return (await api.query.orders.lastOrderByCustomer(substrateAddress)).toString();
}

export async function queryOrderDetailByOrderID(api: ApiPromise, orderID: string): Promise<Order> {
  const res = (await api.query.orders.orders(orderID)).toHuman();
  return new Order(res);
}