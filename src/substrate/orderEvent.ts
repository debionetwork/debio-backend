import { ApiPromise } from "@polkadot/api";
import { Option } from '@polkadot/types';
import { DbioBalanceService } from "src/dbio-balance/dbio_balance.service";
import { EscrowService } from "src/escrow/escrow.service";
import { RewardDto } from "src/reward/dto/reward.dto";
import { RewardService } from "src/reward/reward.service";
import { SubstrateService } from "./substrate.service";
import {
  Logger,
} from '@nestjs/common';

export class OrderEventHandler {
    constructor(
      private escrowService: EscrowService,
      private substrateApi: ApiPromise,
      private logger: Logger,
      private substrateService: SubstrateService,
      private dbioBalanceService: DbioBalanceService,
      private rewardService: RewardService
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
        const orderByOrderId = await (
          await this.substrateApi.tx.orders.orders(order.order_id)
          ).toJSON()
        const serviceByOrderId = await (
          await this.substrateApi.tx.services.services(order.order_id)
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