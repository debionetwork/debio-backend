import { ApiPromise } from '@polkadot/api';
import { Option } from '@polkadot/types';
import { EscrowService } from '../endpoints/escrow/escrow.service';
import { RewardDto } from '../common/reward/dto/reward.dto';
import { RewardService } from '../common/reward/reward.service';
import { SubstrateService } from './substrate.service';
import { Logger } from '@nestjs/common';
import { TransactionLoggingService } from '../common/transaction-logging/transaction-logging.service';
import { TransactionLoggingDto } from '../common/transaction-logging/dto/transaction-logging.dto';
import { ethers } from 'ethers'
import { DebioConversionService } from '../common/debio-conversion/debio-conversion.service';

export class OrderEventHandler {
  constructor(
    private escrowService: EscrowService,
    private substrateApi: ApiPromise,
    private logger: Logger,
    private substrateService: SubstrateService,
    private exchangeCacheService: DebioConversionService,
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
    await this.logger.log('OrderCreated!');
    const order = event.data[0].toJSON();
    
    try {
      const isOrderHasBeenInsert = await this.loggingService.getLoggingByHashAndStatus(
        order.id,
        1
      )
      order.dnaSampleTrackingId = ethers.utils.toUtf8String(order.dnaSampleTrackingId)
      order.additionalPrices[0].value = Number(order.additionalPrices[0].value) / 10**18
      order.additionalPrices[0].component = ethers.utils.toUtf8String(order.additionalPrices[0].component)
      order.prices[0].value = Number(order.prices[0].value) / 10**18
      order.prices[0].component = ethers.utils.toUtf8String(order.prices[0].component)
      
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
      if (!isOrderHasBeenInsert) {    
        await this.loggingService.create(orderLogging);
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }

  async onOrderPaid(event) {
    await this.logger.log('OrderPaid!');
    const order = event.data[0].toJSON();
    
    try {
      const isOrderHasBeenInsert = await this.loggingService.getLoggingByHashAndStatus(
        order.id,
        2
      )
      order.dnaSampleTrackingId = ethers.utils.toUtf8String(order.dnaSampleTrackingId)
      order.additionalPrices[0].value = Number(order.additionalPrices[0].value) / 10**18
      order.additionalPrices[0].component = ethers.utils.toUtf8String(order.additionalPrices[0].component)
      order.prices[0].value = Number(order.prices[0].value) / 10**18
      order.prices[0].component = ethers.utils.toUtf8String(order.prices[0].component)
      
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
      if (!isOrderHasBeenInsert) {    
        await this.loggingService.create(orderLogging);
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }

  async onOrderFulfilled(event) {
    await this.logger.log('Order Fulfilled!');
    const order = event.data[0].toJSON();
    
    try {
      const isOrderHasBeenInsert = await this.loggingService.getLoggingByHashAndStatus(
        order.id,
        3
      )
      order.dnaSampleTrackingId = ethers.utils.toUtf8String(order.dnaSampleTrackingId)
      order.additionalPrices[0].value = Number(order.additionalPrices[0].value) / 10**18
      order.additionalPrices[0].component = ethers.utils.toUtf8String(order.additionalPrices[0].component)
      order.prices[0].value = Number(order.prices[0].value) / 10**18
      order.prices[0].component = ethers.utils.toUtf8String(order.prices[0].component)
      
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
      //logging transaction
      if (!isOrderHasBeenInsert) {
        await this.loggingService.create(orderLogging);
      }

      const resp =
        await this.substrateApi.query.userProfile.ethAddressByAccountId(
          order['sellerId'],
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
        orderByOrderId['orderFlow'] === 'StakingRequestService' &&
        serviceByOrderId['serviceFlow'] === 'StakingRequestService'
      ) {
        const serviceRequest = await (
          await this.substrateApi.query.serviceRequest.serviceInvoiceByOrderId(
            order.id,
          )
        ).toJSON();
        const debioToDai = Number(
          (await this.exchangeCacheService.getExchange())['dbioToDai'],
        );
        const servicePrice = order['price'][0].value * debioToDai;
        // send reward to customer
        await this.substrateService.sendReward(order.customerId, servicePrice);
        await this.substrateApi.tx.serviceRequest.serviceInvoiceByOrderId(
          serviceRequest['hash_'],
        );

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

      await this.escrowService.orderFulfilled(order);

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
      await this.logger.log(err);
      this.logger.log(`Forward payment failed | err -> ${err}`);
    }
  }

  async onOrderRefunded(event) {
    await this.logger.log('OrderRefunded!');
    const order = event.data[0].toJSON();
    
    try {
      const isOrderHasBeenInsert = await this.loggingService.getLoggingByHashAndStatus(
        order.id,
        4
      )
      order.dnaSampleTrackingId = ethers.utils.toUtf8String(order.dnaSampleTrackingId)
      order.additionalPrices[0].value = Number(order.additionalPrices[0].value) / 10**18
      order.additionalPrices[0].component = ethers.utils.toUtf8String(order.additionalPrices[0].component)
      order.prices[0].value = Number(order.prices[0].value) / 10**18
      order.prices[0].component = ethers.utils.toUtf8String(order.prices[0].component)
      
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
      if (!isOrderHasBeenInsert) {      
        await this.loggingService.create(orderLogging);
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }

  async onOrderCancelled(event) {
    await this.logger.log('OrderCancelled');
    const order = event.data[0].toJSON();
    
    try {
      const isOrderHasBeenInsert = await this.loggingService.getLoggingByHashAndStatus(
        order.id,
        5
      )
      order.dnaSampleTrackingId = ethers.utils.toUtf8String(order.dnaSampleTrackingId)
      order.additionalPrices[0].value = Number(order.additionalPrices[0].value) / 10**18
      order.additionalPrices[0].component = ethers.utils.toUtf8String(order.additionalPrices[0].component)
      order.prices[0].value = Number(order.prices[0].value) / 10**18
      order.prices[0].component = ethers.utils.toUtf8String(order.prices[0].component)
      
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
      if (!isOrderHasBeenInsert) {      
        await this.loggingService.create(orderLogging);
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }

  onOrderNotFound(event) {
    this.logger.log('OrderNotFound!');
  }

  async onOrderFailed(event) {
    await this.logger.log('OrderFailed!');
    const order = event.data[0].toJSON();
    order.dnaSampleTrackingId = ethers.utils.toUtf8String(order.dnaSampleTrackingId)
    order.additionalPrices[0].value = Number(order.additionalPrices[0].value) / 10**18
    order.additionalPrices[0].component = ethers.utils.toUtf8String(order.additionalPrices[0].component)
    order.prices[0].value = Number(order.prices[0].value) / 10**18
    order.prices[0].component = ethers.utils.toUtf8String(order.prices[0].component)
  
    await this.escrowService.refundOrder(order.id);
    await this.substrateService.setOrderRefunded(order.id);
  }
}
