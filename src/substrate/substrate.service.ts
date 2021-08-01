import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { EscrowService } from 'src/escrow/escrow.service';
import spec from './substrateTypes.json';

@Injectable()
export class SubstrateService implements OnModuleInit {
  private api: ApiPromise;
  private orderEventHandler: OrderEventHandler;

  constructor(
    @Inject(forwardRef(() => EscrowService))
    private escrowService: EscrowService,
  ) {
    this.orderEventHandler = new OrderEventHandler(escrowService);
  }

  async onModuleInit() {
    const wsProvider = new WsProvider(process.env.SUBSTRATE_URL);
    this.api = await ApiPromise.create({
      provider: wsProvider,
      types: spec,
    });

    // this.escrowService = new EscrowService(this);
  }

  async getSubstrateAddressByEthAddress(ethAddress: string) {
    console.log('TODO: Implement');
  }

  async getLastOrderByCustomer(substrateAddress: string) {
    console.log('TODO: Implement');
  }

  async setOrderPaid(orderId: string) {
    console.log('[setOrderPaid] orderID: ', orderId);
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
  constructor(private escrowService: EscrowService) {}
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
    this.escrowService.createOrder(order.toJSON());
  }

  onOrderPaid(event) {
    console.log('OrderPaid! TODO: handle event');
    this.escrowService.orderSuccess(event);
  }

  async onOrderSuccess(event) {
    console.log('OrderSuccess! TODO: Forward token from escrow to seller');
    const order = event.data[0];
    const data = order.toJSON();
    console.log('Order = ', order.toJSON());
    this.escrowService.orderSuccess(order.toJSON());
  }

  onOrderRefunded(event) {
    console.log('OrderRefunded! TODO: handle event');
  }

  onOrderCancelled(event) {
    console.log('OrderCancelled! TODO: handle event');
    const order = event.data[0];
    console.log('onOrderCancelled = ', order.toJSON());
    this.escrowService.cancelOrder(order.toJSON());
  }

  onOrderNotFound(event) {
    console.log('OrderNotFound TODO: handle event');
  }

  onOrderFailed(event) {
    console.log('OrderFailed! TODO: handle event');
    const order = event.data[0];
    console.log('onOrderRefunded = ', order.toJSON());
    this.escrowService.refundOrder(order.toJSON());
  }
}
