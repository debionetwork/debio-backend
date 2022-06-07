import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Option } from '@polkadot/types';
import { OrderFulfilledCommand } from './order-fulfilled.command';
import {
  DateTimeProxy,
  DebioConversionService,
  RewardService,
  SubstrateService,
  TransactionLoggingService,
} from '../../../../../common';
import {
  convertToDbioUnitString,
  Order,
  queryEthAdressByAccountId,
  queryOrderDetailByOrderID,
  queryServiceById,
  queryServiceInvoiceByOrderId,
  sendRewards,
} from '@debionetwork/polkadot-provider';
import { EscrowService } from '../../../../../common/modules/escrow/escrow.service';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import { RewardDto } from '../../../../../common/modules/reward/dto/reward.dto';
import { NotificationDto } from '../../../../../endpoints/notification/dto/notification.dto';
import { NotificationService } from '../../../../../endpoints/notification/notification.service';

@Injectable()
@CommandHandler(OrderFulfilledCommand)
export class OrderFulfilledHandler
  implements ICommandHandler<OrderFulfilledCommand>
{
  private readonly logger: Logger = new Logger(OrderFulfilledCommand.name);

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly exchangeCacheService: DebioConversionService,
    private readonly rewardService: RewardService,
    private readonly escrowService: EscrowService,
    private readonly substrateService: SubstrateService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: OrderFulfilledCommand) {
    await this.logger.log('Order Fulfilled!');

    const order: Order = command.orders;
    order.normalize();

    try {
      const isOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(order.id, 3);

      const orderHistory = await this.loggingService.getLoggingByOrderId(
        order.id,
      );
      // Logging data input
      const orderLogging: TransactionLoggingDto = {
        address: order.customerId,
        amount: +order.additionalPrices[0].value + +order.prices[0].value,
        created_at: order.updatedAt,
        currency: order.currency.toUpperCase(),
        parent_id: BigInt(orderHistory.id),
        ref_number: order.id,
        transaction_status: 3,
        transaction_type: 1,
      };

      // Logging transaction
      if (isOrderHasBeenInsert) {
        return;
      }
      await this.loggingService.create(orderLogging);

      const labEthAddress: any = await queryEthAdressByAccountId(
        this.substrateService.api as any,
        order['sellerId'],
      );

      if ((labEthAddress as Option<any>).isNone) {
        return null;
      }

      const orderByOrderId = await queryOrderDetailByOrderID(
        this.substrateService.api as any,
        order.id,
      );
      const serviceByOrderId = await queryServiceById(
        this.substrateService.api as any,
        order.serviceId,
      );
      const totalPrice = order.prices.reduce(
        (acc, price) => acc + +price.value,
        0,
      );
      const totalAdditionalPrice = order.additionalPrices.reduce(
        (acc, price) => acc + +price.value,
        0,
      );
      const amountToForward = totalPrice + totalAdditionalPrice;

      if (
        orderByOrderId['orderFlow'] === 'StakingRequestService' &&
        serviceByOrderId['serviceFlow'] === 'StakingRequestService'
      ) {
        const serviceRequest = await queryServiceInvoiceByOrderId(
          this.substrateService.api as any,
          order.id,
        );
        const debioToDai = Number(
          (await this.exchangeCacheService.getExchange())['dbioToDai'],
        );
        const servicePrice = +order.prices[0].value * debioToDai;

        // Write Logging Notification Customer Reward From Request Service
        const customerNotificationInput: NotificationDto = {
          role: 'Customer',
          entity_type: 'Order',
          entity: 'OrderFulfilled',
          description: `Congrats! You’ve got ${servicePrice} DBIO as a reward for completing the request test for ${order.id} from the service requested`,
          read: false,
          created_at: await this.dateTimeProxy.new(),
          updated_at: await this.dateTimeProxy.new(),
          deleted_at: null,
          from: 'Debio Network',
          to: order.customerId,
        };

        // Send reward to customer
        await sendRewards(
          this.substrateService.api as any,
          this.substrateService.pair,
          order.customerId,
          convertToDbioUnitString(servicePrice),
          () =>
            this.callbackInsertNotificationLogging(customerNotificationInput),
        );

        await queryServiceInvoiceByOrderId(
          this.substrateService.api as any,
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

        // Send reward to lab
        await sendRewards(
          this.substrateService.api as any,
          this.substrateService.pair,
          order.customerId,
          convertToDbioUnitString(servicePrice / 10),
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

      // Write Logging Notification Customer Reward From Request Service
      const labPaymentNotification: NotificationDto = {
        role: 'Lab',
        entity_type: 'Genetic Testing Order',
        entity: 'Order Fulfilled',
        description: `You've received ${amountToForward} DAI for completeing the requested test for ${order.id}.`,
        read: false,
        created_at: this.dateTimeProxy.new(),
        updated_at: this.dateTimeProxy.new(),
        deleted_at: null,
        from: 'Debio Network',
        to: order.sellerId,
      };

      await this.notificationService.insert(labPaymentNotification);

      this.logger.log('OrderFulfilled Event');
      this.logger.log(`labEthAddress: ${labEthAddress}`);
      this.logger.log(`amountToForward: ${amountToForward}`);
    } catch (err) {
      await this.logger.log(err);
      this.logger.log(`Forward payment failed | err -> ${err}`);
    }
  }

  callbackInsertNotificationLogging(data: NotificationDto) {
    this.notificationService.insert(data);
  }
}
