import { ApiPromise } from '@polkadot/api';
import { Option } from '@polkadot/types';
import { DbioBalanceService } from 'src/dbio-balance/dbio_balance.service';
import { EscrowService } from 'src/escrow/escrow.service';
import { RewardDto } from 'src/reward/dto/reward.dto';
import { RewardService } from 'src/reward/reward.service';
import { SubstrateService } from './substrate.service';
import { Logger } from '@nestjs/common';
import { TransactionLoggingService } from 'src/transaction-logging/transaction-logging.service';
import { TransactionLoggingDto } from 'src/transaction-logging/dto/transaction-logging.dto';

export class OrderEventHandler {
  constructor(
    private escrowService: EscrowService,
    private substrateApi: ApiPromise,
    private logger: Logger,
    private substrateService: SubstrateService,
    private dbioBalanceService: DbioBalanceService,
    private rewardService: RewardService,
    private loggingService: TransactionLoggingService,
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
    const orderLogging: TransactionLoggingDto = {
      address: order.customerId,
      amount: order.additionalPrices[0].value + order.prices[0].value,
      created_at: new Date(parseInt(order.createdAt)),
      currency: order.currency.toUpperCase(),
      parent_id: BigInt(0),
      ref_number: order.id,
      transaction_status: 1,
      transaction_type: 1,
    };

    try {
      await this.loggingService.create(orderLogging);
    } catch (error) {
      console.log(error);
    }
  }

  async onOrderPaid(event) {
    console.log('OrderPaid!');
    const order = event.data[0].toJSON();
    const orderHistory = await this.loggingService.getLoggingByOrderId(
      order.id,
    );

    //insert logging to DB
    const orderLogging: TransactionLoggingDto = {
      address: order.customerId,
      amount: order.additionalPrices[0].value + order.prices[0].value,
      created_at: new Date(parseInt(order.updatedAt)),
      currency: order.currency.toUpperCase(),
      parent_id: BigInt(orderHistory.id),
      ref_number: order.id,
      transaction_status: 2,
      transaction_type: 1,
    };

    try {
      await this.loggingService.create(orderLogging);
    } catch (error) {
      console.log(error);
    }
  }

  async onOrderFulfilled(event) {
    console.log('Order Fulfilled!');
    const order = event.data[0].toJSON();
    const orderHistory = await this.loggingService.getLoggingByOrderId(
      order.id,
    );

    //Logging data input
    const orderLogging: TransactionLoggingDto = {
      address: order.customerId,
      amount: order.additionalPrices[0].value + order.prices[0].value,
      created_at: new Date(parseInt(order.updatedAt)),
      currency: order.currency.toUpperCase(),
      parent_id: BigInt(orderHistory.id),
      ref_number: order.id,
      transaction_status: 3,
      transaction_type: 1,
    };

    try {
      //logging transaction
      await this.loggingService.create(orderLogging);

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
      ).toJSON();
      const serviceByOrderId = await (
        await this.substrateApi.query.services.services(order.id)
      ).toJSON();
      const totalPrice = order.prices.reduce(
        (acc, price) => acc + price.value,
        0,
      );
      const totalAdditionalPrice = order.additionalPrices.reduce(
        (acc, price) => acc + price.value,
        0,
      );
      const amountToForward = totalPrice + totalAdditionalPrice;

      if (
        orderByOrderId['order_flow'] === 'StakingRequestService' &&
        serviceByOrderId['service_flow'] === 'StakingRequestService'
      ) {
        const debioToDai = Number(
          (await this.dbioBalanceService.getDebioBalance()).dai,
        );
        const servicePrice = order['price'][0].value * debioToDai;
        // send reward to customer
        await this.substrateService.sendReward(order.customerId, servicePrice);

        // Write Logging Reward Customer Staking Request Service
        const dataCustomerLoggingInput: RewardDto = {
          address: order.customerId,
          ref_number: order.id,
          reward_amount: servicePrice,
          reward_type: 'Customer Stake Request Service',
          currency: 'DBIO',
          created_at: new Date(),
        };
        await this.rewardService.insert(dataCustomerLoggingInput);

        // send reward to lab
        await this.substrateService.sendReward(
          order.customerId,
          servicePrice / 10,
        );

        // Write Logging Reward Lab
        const dataLabLoggingInput: RewardDto = {
          address: order.customerId,
          ref_number: order.id,
          reward_amount: servicePrice / 10,
          reward_type: 'Lab Provide Requested Service',
          currency: 'DBIO',
          created_at: new Date(),
        };
        await this.rewardService.insert(dataLabLoggingInput);
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
    const orderHistory = await this.loggingService.getLoggingByOrderId(
      order.id,
    );

    //insert logging to DB
    const orderLogging: TransactionLoggingDto = {
      address: order.customerId,
      amount: order.prices[0].value,
      created_at: new Date(parseInt(order.updatedAt)),
      currency: order.currency.toUpperCase(),
      parent_id: BigInt(orderHistory.id),
      ref_number: order.id,
      transaction_status: 4,
      transaction_type: 1,
    };

    try {
      await this.loggingService.create(orderLogging);
    } catch (error) {
      console.log(error);
    }
  }

  async onOrderCancelled(event) {
    console.log('OrderCancelled');
    const order = event.data[0].toJSON();
    const orderHistory = await this.loggingService.getLoggingByOrderId(
      order.id,
    );
    //Logging data Input
    const orderLogging: TransactionLoggingDto = {
      address: order.customerId,
      amount: order.additionalPrices[0].value + order.prices[0].value,
      created_at: new Date(parseInt(order.updatedAt)),
      currency: order.currency.toUpperCase(),
      parent_id: BigInt(orderHistory.id),
      ref_number: order.id,
      transaction_status: 5,
      transaction_type: 1,
    };
    await this.escrowService.cancelOrder(order);

    try {
      await this.loggingService.create(orderLogging);
    } catch (error) {
      console.log(error);
    }
  }

  onOrderNotFound(event) {
    console.log('OrderNotFound!');
  }

  async onOrderFailed(event) {
    console.log('OrderFailed!');
    const order = event.data[0].toJSON();

    await this.escrowService.refundOrder(order.id);
    await this.substrateService.setOrderRefunded(order.id);
  }
}
