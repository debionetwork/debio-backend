import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import {
  forwardRef,
  Inject,
  Injectable,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { Option } from '@polkadot/types';
import { EscrowService } from 'src/escrow/escrow.service';
import spec from './substrateTypes.json';
import GeneticTestingEventHandler from './geneticTestingEvent';
import { QualityControlledService } from 'src/quality-Controlled/quality-controlled.service';

@Injectable()
export class SubstrateService implements OnModuleInit {
  private api: ApiPromise;
  private escrowWallet: any;
  private orderEventHandler: OrderEventHandler;
  private geneticTestingEventHandler: GeneticTestingEventHandler;
  private readonly logger: Logger = new Logger(SubstrateService.name);
  private substrateService: SubstrateService;

  constructor(
    @Inject(forwardRef(() => EscrowService))
    private escrowService: EscrowService,
    private readonly qualityService: QualityControlledService,
  ) {}

  async onModuleInit() {
    const wsProvider = new WsProvider(process.env.SUBSTRATE_URL);
    this.api = await ApiPromise.create({
      provider: wsProvider,
      types: spec,
    });

    const keyring = new Keyring({ type: 'sr25519' });
    this.escrowWallet = await keyring.addFromUri(
      process.env.ESCROW_SUBSTRATE_MNEMONIC,
    );

    this.orderEventHandler = new OrderEventHandler(
      this.escrowService,
      this.api,
      this.logger,
    );

    this.geneticTestingEventHandler = new GeneticTestingEventHandler(
      this.qualityService,
      this.substrateService,
      this.api,
    );
  }

  async getSubstrateAddressByEthAddress(ethAddress: string) {
    const response = await this.api.query.userProfile.accountIdByEthAddress(
      ethAddress,
    );

    console.log(response);
    return response.toString();
  }

  async getLastOrderByCustomer(substrateAddress: string) {
    const response = await this.api.query.orders.lastOrderByCustomer(
      substrateAddress,
    );

    return response.toString();
  }

  async getOrderDetailByOrderID(orderID: string) {
    const response = await this.api.query.orders.orders(orderID);
    return response.toJSON();
  }

  async setOrderPaid(orderId: string) {
    const wallet = this.escrowWallet;
    const response = await this.api.tx.orders
      .setOrderPaid(orderId)
      .signAndSend(wallet, {
        nonce: -1,
      });

    console.log(response);
  }

  async setOrderRefunded(orderId: string) {
    const wallet = this.escrowWallet;
    const response = await this.api.tx.orders
      .setOrderRefunded(orderId)
      .signAndSend(wallet, {
        nonce: -1,
      });

    console.log(response);
  }

  listenToEvents() {
    this.api.query.system.events((events) => {
      events.forEach((record) => {
        const { event } = record;
        if (event.section !== 'system') {
          console.log('=================');

          console.log('event = ', event.section);
          console.log('method = \n', event.method);
          console.log('method = \n', event.data[0].toJSON());
        }
        switch (
          event.section // event.section == pallet name
        ) {
          case 'orders':
            this.orderEventHandler.handle(event);
            break;
          case 'geneticTesting':
            console.log('masuk genetic testing');

            this.geneticTestingEventHandler.handle(event);
            break;
        }
      });
    });
    // let a;
    //     this.getOrderDetailByOrderID('0xa3c4b90196208529ec490aa8800910678852c82251a847f66c5181aef15a3cd0')
    //       .then((output)=>{
    //         a = output

    //         console.log("ordersssss===", a);

    //       })
  }
}

class OrderEventHandler {
  constructor(
    private escrowService: EscrowService,
    private substrateApi: ApiPromise,
    private logger: Logger,
  ) {}
  handle(event) {
    switch (event.method) {
      case 'OrderCreated':
        this.onOrderCreated(event);
        break;
      case 'OrderPaid':
        this.onOrderPaid(event);
        break;
      case 'OrderFulfilled':
        this.onOrderFulfilled(event);
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
  }

  async onOrderFulfilled(event) {
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

      this.logger.log('OrderFulfilled Event');
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
}
