import { Logger } from "@nestjs/common";
import { ApiPromise } from "@polkadot/api";
import { Option } from '@polkadot/types';
import { EscrowService } from "src/escrow/escrow.service";

export default class GeneticTestingEventHandler {
  constructor(
    private escrowService: EscrowService,
    private substrateApi: ApiPromise,
    private logger: Logger,
  ) {}
  handle(event) {
    switch (event.method) {
      case 'DnaSampleArrived ':
        this.onDnaSampleArrived (event);
        break;
      case 'DnaSampleGenotyped':
        this.onDnaSampleGenotyped(event);
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
        case 'DnaSampleSuccess':
          this.onDnaSampleSuccess(event);
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
  }

  async onOrderSuccess(event) {
    try {
      const order = event.data[0].toJSON();
      const resp =
        await this.substrateApi.query.userProfile.ethAddressByAccountId(
          order['seller_id'],
        );
      if ((resp as Option<any>).isNone) {
        return null;
      }
      const labEthAddress = (resp as Option<any>).unwrap().toString();
      const totalPrice = order.prices.reduce(
        (acc, price) => acc + price.value,
        0,
      );
      const totalAdditionalPrice = order.additional_prices.reduce(
        (acc, price) => acc + price.value,
        0,
      );
      const amountToForward = totalPrice + totalAdditionalPrice;

      this.logger.log('OrderSuccess Event');
      this.logger.log('Forwarding payment to lab');
      this.logger.log(`labEthAddress: ${labEthAddress}`);
      this.logger.log(`amountToForward: ${amountToForward}`);
      const tx = await this.escrowService.forwardPaymentToSeller(
        labEthAddress,
        amountToForward,
      );
      this.logger.log(`Forward payment transaction sent | tx -> ${tx}`);
    } catch (err) {
      console.log(err);
      this.logger.log(`Forward payment failed | err -> ${err}`);
    }
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
  onDnaSampleSuccess(event) {
    console.log('DnaSampleSuccess! TODO: handle event--->',event);
  }

  onDnaSampleArrived (event) {
    console.log('DnaSampleArrived! TODO: handle event');
    const order = event.data[0];
    this.escrowService.createOrder(order.toJSON());
  }

  onDnaSampleGenotyped(event) {
    console.log('DnaSampleGenotyped! TODO: handle event');
  }
}
