export * from './order-cancelled/order-cancelled.command';
export * from './order-created/order-created.command';
export * from './order-failed/order-failed.command';
export * from './order-fulfilled/order-fulfilled.command';
export * from './order-paid/order-paid.command';
export * from './order-refunded/order-refunded.command';

import { OrderCancelledHandler } from './order-cancelled/order-cancelled.handler';
import { OrderCreatedHandler } from './order-created/order-created.handler';
import { OrderFailedHandler } from './order-failed/order-failed.handler';
import { OrderFulfilledHandler } from './order-fulfilled/order-fulfilled.handler';
import { OrderPaidHandler } from './order-paid/order-paid.handler';
import { OrderRefundedHandler } from './order-refunded/order-refunded.handler';

export const OrderCommandHandlers = [
  OrderCancelledHandler,
  OrderCreatedHandler,
  OrderFailedHandler,
  OrderFulfilledHandler,
  OrderPaidHandler,
  OrderRefundedHandler,
];
