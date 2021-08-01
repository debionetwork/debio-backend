import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import spec from './substrateTypes.json';

@Injectable()
export class SubstrateService implements OnModuleInit {
  private api: ApiPromise;
  private orderEventHandler: OrderEventHandler;

  async onModuleInit() {
    Logger.log(' Connecting to substrate chain...');

    const wsProvider = new WsProvider(process.env.SUBSTRATE_URL);
    this.api = await ApiPromise.create({
      provider: wsProvider,
      types: spec,
    });

    this.orderEventHandler = new OrderEventHandler();
  }

  async getSubstrateAddressByEthAddress(ethAddress: string) {
    console.log('TODO: Implement');
  }

  async getLastOrderByCustomer(substrateAddress: string) {
    console.log('TODO: Implement');
  }

  async setOrderPaid(orderId: string) {
    console.log('TODO: Implement');
  }

  listenToEvents() {
    this.api.query.system.events((events) => {
      events.forEach((record) => {
        const { event } = record;

        switch (
          event.section // event.section == pallet name
        ) {
          case 'orders':
            this.orderEventHandler.handle(event);
        }
      });
    });
  }
}

class OrderEventHandler {
  handle(event) {
    switch (event.method) {
      case 'OrderCreated':
        this.onOrderCreated(event);
        break;
      case 'OrderPaid':
        this.onOrderPaid(event);
        break;
      case 'OrderSuccess':
        this.onOrderSuccess(event);
        break;
      case 'OrderRefunded':
        this.onOrderRefunded(event);
        break;
      case 'OrderCancelled':
        this.onOrderCancelled(event);
        break;
      case 'OrderNotFound':
        this.onOrderNotFound(event);
        break;
      case 'OrderFailed':
        this.onOrderFailed(event);
        break;
    }
  }

  onOrderCreated(event) {
    console.log('OrderCreated! TODO: handle event');
    const order = event.data[0];
    // substrateApi.escrow.CreatedRequest(order.toJSON());
  }

  onOrderPaid(event) {
    console.log('OrderPaid! TODO: handle event');
  }

  async onOrderSuccess(event) {
    console.log('OrderSuccess! TODO: Forward token from escrow to seller');
    const order = event.data[0];
    const data = order.toJSON();
    console.log('Order = ', order.toJSON());
    // substrateApi.escrow.OrderSuccess(order.toJSON());
  }

  onOrderRefunded(event) {
    console.log('OrderRefunded! TODO: handle event');
  }

  onOrderCancelled(event) {
    console.log('OrderCancelled! TODO: handle event');
    const order = event.data[0];
    console.log('onOrderRefunded = ', order.toJSON());
    // substrateApi.escrow.CancelOrder(order.toJSON());
  }

  onOrderNotFound(event) {
    console.log('OrderNotFound TODO: handle event');
  }

  onOrderFailed(event) {
    console.log('OrderFailed! TODO: handle event');
    const order = event.data[0];
    console.log('onOrderRefunded = ', order.toJSON());
    // substrateApi.escrow.RefundRequest(order.toJSON());
  }
}
