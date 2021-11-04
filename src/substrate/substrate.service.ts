import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import {
  forwardRef,
  Inject,
  Injectable,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { Option } from '@polkadot/types';
import { EscrowService } from '../escrow/escrow.service';
import spec from './substrateTypes.json';
import { RegistrationRole } from './substrate.controller';
import GeneticTestingEventHandler from './geneticTestingEvent';
import { TransactionLoggingService } from '../transaction-logging/transaction-logging.service';
import { DbioBalanceService } from 'src/dbio-balance/dbio_balance.service';
import { RewardService } from '../reward/reward.service';
import { RewardDto } from 'src/reward/dto/reward.dto';
import { TransactionLoggingDto } from 'src/transaction-logging/dto/transaction-logging.dto';

@Injectable()
export class SubstrateService implements OnModuleInit {
  private api: ApiPromise;
  private escrowWallet: any;
  private faucetWallet: KeyringPair;
  private sudoWallet: KeyringPair;
  private orderEventHandler: OrderEventHandler;
  private geneticTestingEventHandler: GeneticTestingEventHandler;
  private readonly logger: Logger = new Logger(SubstrateService.name);
  private substrateService: SubstrateService;
  private dbioBalanceService: DbioBalanceService;
  private rewardService: RewardService;

  constructor(
    @Inject(forwardRef(() => EscrowService))
    private escrowService: EscrowService,
    private readonly transactionLoggingService: TransactionLoggingService,
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
    this.faucetWallet = await keyring.addFromUri(
      process.env.FAUCET_SUBSTRATE_MNEMONIC,
    );
    this.sudoWallet = await keyring.addFromUri(
      process.env.SUDO_SUBSTRATE_MNEMONIC,
    );

    this.orderEventHandler = new OrderEventHandler(
      this.escrowService,
      this.api,
      this.logger,
      this.substrateService,
      this.dbioBalanceService,
      this.rewardService,
      this.transactionLoggingService
    );

    this.geneticTestingEventHandler = new GeneticTestingEventHandler(
      this.transactionLoggingService,
      this.rewardService,
      this.dbioBalanceService,
      this.substrateService,
      this.api,
    );
  }

  async getSubstrateAddressByEthAddress(ethAddress: string) {
    const response = await this.api.query.userProfile.accountIdByEthAddress(
      ethAddress,
    );

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

  // get balance of account
  async getBalanceAccount(accountId: string) {
    const { data: balance } = await this.api.query.system.account(accountId);

    const chainDecimal = this.api.registry.chainDecimals;
    const decimalBalance =
      Number(balance.free.toBigInt()) / Math.pow(10, chainDecimal[0]);

    return decimalBalance;
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

  async sendDbioFromFaucet(
    accountId: string,
    amount: number | string,
  ): Promise<any> {
    const wallet = this.faucetWallet;

    return new Promise(async (resolve) => {
      const unsub = await this.api.tx.balances
        .transfer(accountId, amount)
        .signAndSend(wallet, { nonce: -1 }, (result) => {
          if (result.status.isInBlock) {
            this.logger.log(
              `Transaction included at blockHash ${result.status.asInBlock}`,
            );
          } else if (result.status.isFinalized) {
            this.logger.log(
              `Transaction finalized at blockHash ${result.status.asFinalized}`,
            );
            unsub();
            resolve(true);
          }
        });
    });
  }

  async hasRole(accountId: string, role: RegistrationRole): Promise<boolean> {
    let hasRole = false;
    let resp: any;
    switch (role) {
      case 'doctor':
        resp = await this.api.query.doctors.doctors(accountId);
        if ((resp as Option<any>).isSome) {
          hasRole = true;
        }
      case 'hospital':
        resp = await this.api.query.hospitals.hospitals(accountId);
        if ((resp as Option<any>).isSome) {
          hasRole = true;
        }
      case 'lab':
        resp = await this.api.query.labs.labs(accountId);
        if ((resp as Option<any>).isSome) {
          hasRole = true;
        }
    }

    return hasRole;
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
            break;
          case 'geneticTesting':
            this.geneticTestingEventHandler.handle(event);
            break;
        }
      });
    });
  }

  async bindEthAddressToSubstrateAddress(
    ethAddress: string,
    substrateAddress: string,
  ) {
    const wallet = this.sudoWallet;

    return new Promise(async (resolve) => {
      const unsub = await this.api.tx.sudo
        .sudo(
          this.api.tx.userProfile.sudoSetEthAddress(
            substrateAddress,
            ethAddress,
          ),
        )
        .signAndSend(this.sudoWallet, { nonce: -1 }, (result) => {
          if (result.status.isInBlock) {
            this.logger.log(
              `Transaction included at blockHash ${result.status.asInBlock}`,
            );
          } else if (result.status.isFinalized) {
            this.logger.log(
              `Transaction finalized at blockHash ${result.status.asFinalized}`,
            );
            unsub();
            resolve(true);
          }
        });
    });
  }

  async submitStaking(hash: String, orderId: String) {
    const wallet = this.escrowWallet;
    const response = await this.api.tx.geneticTesting
      .submitDataBountyDetails(hash, orderId)
      .signAndSend(wallet, {
        nonce: -1,
      });
    console.log(response);
  }

  async sendReward(
    acountId: string,
    amount: number | string
    ) {      
    const wallet = this.escrowWallet;    
    const response = await this.api.tx.rewards
      .rewardFunds(
        acountId,
        amount
      )
      .signAndSend(wallet, {
        nonce: -1,
      });

    console.log(response);
  }

  async verificationLabWithSubstrate(
    acountId: string,
    labStatus:  string
    ) {      
      const wallet = this.sudoWallet;    
    const response = await this.api.tx.labs
      .updateLabVerificationStatus(
        acountId,
        labStatus
      )
      .signAndSend(wallet, {
        nonce: -1,
      });
      
    console.log(response);
  }
}
class OrderEventHandler {
  constructor(
    private escrowService: EscrowService,
    private substrateApi: ApiPromise,
    private logger: Logger,
    private substrateService: SubstrateService,
    private dbioBalanceService: DbioBalanceService,
    private rewardService: RewardService,
    private loggingService: TransactionLoggingService
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

  async onOrderCreated(event) {
    console.log('OrderCreated!');
    const order = event.data[0].toJSON();

    console.log(order);
    //insert logging to DB
    const orderLogging : TransactionLoggingDto = {
      address: order.customer_id,
      amount: (order.additional_prices[0].value + order.prices[0].value),
      created_at: new Date(parseInt(order.created_at)),
      currency: order.currency.toUpperCase(),
      parent_id: BigInt(0),
      ref_number: order.id,
      transaction_status: 1,
      transaction_type: 1,
    }

    try {
      await this.loggingService.create(orderLogging)
    } catch (error) {
      console.log(error);
    }
  }

  async onOrderPaid(event) {
    console.log('OrderPaid!');
    const order = event.data[0].toJSON();
    const orderHistory = await this.loggingService.getLoggingByOrderId(order.id)

    //insert logging to DB
    const orderLogging : TransactionLoggingDto = {
      address: order.customer_id,
      amount: (order.additional_prices[0].value + order.prices[0].value),
      created_at: new Date(parseInt(order.updated_at)),
      currency: order.currency.toUpperCase(),
      parent_id: BigInt(orderHistory.id),
      ref_number: order.id,
      transaction_status: 2,
      transaction_type: 1,
    }

    try {
      await this.loggingService.create(orderLogging)
    } catch (error) {
      console.log(error);
    }
  }

  async onOrderFulfilled(event) {
    console.log('Order Fulfilled!');
    const order = event.data[0].toJSON();
    const orderHistory = await this.loggingService.getLoggingByOrderId(order.id)

    //Logging data input
    const orderLogging : TransactionLoggingDto = {
      address: order.customer_id,
      amount: (order.additional_prices[0].value + order.prices[0].value),
      created_at: new Date(parseInt(order.updated_at)),
      currency: order.currency.toUpperCase(),
      parent_id: BigInt(orderHistory.id),
      ref_number: order.id,
      transaction_status: 3,
      transaction_type: 1,
    }

    try {
      //logging transaction 
      await this.loggingService.create(orderLogging)

      const resp =
        await this.substrateApi.query.userProfile.ethAddressByAccountId(
          order['seller_id'],
        );
      if ((resp as Option<any>).isNone) {
        return null;
      }
      const labEthAddress = (resp as Option<any>).unwrap().toString();
      const orderByOrderId = await (
        await this.substrateApi.query.orders.orders(order.id)
        ).toJSON()
      const serviceByOrderId = await (
        await this.substrateApi.query.services.services(order.id)
        ).toJSON()
      const totalPrice = order.prices.reduce(
        (acc, price) => acc + price.value,
        0,
      );
      const totalAdditionalPrice = order.additional_prices.reduce(
        (acc, price) => acc + price.value,
        0,
      );
      const amountToForward = totalPrice + totalAdditionalPrice;

      if(orderByOrderId['order_flow']==='StakingRequestService' && serviceByOrderId['service_flow']==='StakingRequestService'){
        const debioToDai = Number((await this.dbioBalanceService.getDebioBalance()).dai)
        const servicePrice = order['price'][0].value * debioToDai
        // send reward to customer
        await this.substrateService.sendReward(order.customer_id, servicePrice)

        // Write Logging Reward Customer Staking Request Service
        const dataCustomerLoggingInput: RewardDto = {
          address: order.customer_id,
          ref_number: order.id,
          reward_amount: servicePrice,
          reward_type: 'Customer Stake Request Service',
          currency: 'DBIO',
          created_at: new Date()
        }
        await this.rewardService.insert(dataCustomerLoggingInput)

        // send reward to lab
        await this.substrateService.sendReward(order.customer_id, (servicePrice/10))

        // Write Logging Reward Lab
          const dataLabLoggingInput: RewardDto = {
          address: order.customer_id,
          ref_number: order.id,
          reward_amount: (servicePrice/10),
          reward_type: 'Lab Provide Requested Service',
          currency: 'DBIO',
          created_at: new Date()
        }
        await this.rewardService.insert(dataLabLoggingInput)
      }

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

  async onOrderRefunded(event) {
    console.log('OrderRefunded!');

    const order = event.data[0].toJSON();
    const orderHistory = await this.loggingService.getLoggingByOrderId(order.id)

    //insert logging to DB
    const orderLogging : TransactionLoggingDto = {
      address: order.customer_id,
      amount: order.prices[0].value,
      created_at: new Date(parseInt(order.updated_at)),
      currency: order.currency.toUpperCase(),
      parent_id: BigInt(orderHistory.id),
      ref_number: order.id,
      transaction_status: 4,
      transaction_type: 1,
    }

    try {
      await this.loggingService.create(orderLogging)
    } catch (error) {
      console.log(error);
    }
  }

  async onOrderCancelled(event) {
    console.log('OrderCancelled');
    const order = event.data[0].toJSON();
    const orderHistory = await this.loggingService.getLoggingByOrderId(order.id)
    //Logging data Input
    const orderLogging : TransactionLoggingDto = {
      address: order.customer_id,
      amount: (order.additional_prices[0].value + order.prices[0].value),
      created_at: new Date(parseInt(order.updated_at)),
      currency: order.currency.toUpperCase(),
      parent_id: BigInt(orderHistory.id),
      ref_number: order.id,
      transaction_status: 5,
      transaction_type: 1,
    }
    await this.escrowService.cancelOrder(order);

    try {
      await this.loggingService.create(orderLogging)
    } catch (error) {
      console.log(error);
    }
  }

  onOrderNotFound(event) {
    console.log('OrderNotFound!');
  }

  onOrderFailed(event) {
    console.log('OrderFailed!');
    const order = event.data[0].toJSON();
    console.log('onOrderRefunded = ', order.toJSON());
    this.escrowService.refundOrder(order.toJSON());
  }
}
