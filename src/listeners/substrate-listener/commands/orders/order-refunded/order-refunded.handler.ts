import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderRefundedCommand } from './order-refunded.command';
import {
  DateTimeProxy,
  NotificationService,
  TransactionLoggingService,
} from '../../../../../common';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import { Order } from '@debionetwork/polkadot-provider';
import { NotificationDto } from '../../../../../common/modules/notification/dto/notification.dto';

@Injectable()
@CommandHandler(OrderRefundedCommand)
export class OrderRefundedHandler
  implements ICommandHandler<OrderRefundedCommand>
{
  private readonly logger: Logger = new Logger(OrderRefundedCommand.name);

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: OrderRefundedCommand) {
    const order: Order = command.orders;
    order.normalize();
    await this.logger.log(`OrderRefunded With Order ID: ${order.id}!`);

    try {
      const isOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(order.id, 4);
      const orderHistory = await this.loggingService.getLoggingByOrderId(
        order.id,
      );

      //insert logging to DB
      const orderLogging: TransactionLoggingDto = {
        address: order.customerId,
        amount: +order.prices[0].value,
        created_at: order.updatedAt,
        currency: order.currency.toUpperCase(),
        parent_id: BigInt(orderHistory.id),
        ref_number: order.id,
        transaction_status: 4,
        transaction_type: 1,
      };
      if (!isOrderHasBeenInsert) {
        await this.loggingService.create(orderLogging);
      }

      const currDateTime = this.dateTimeProxy.new();

      const customerOrderRefundedNotification: NotificationDto = {
        role: 'Customer',
        entity_type: 'Genetic Testing Order',
        entity: 'Order Refunded',
        description: `Your service fee from ${order.dnaSampleTrackingId} has been refunded, kindly check your account balance.`,
        read: false,
        created_at: currDateTime,
        updated_at: currDateTime,
        deleted_at: null,
        from: 'Debio Network',
        to: order.customerId,
      };
      await this.notificationService.insert(customerOrderRefundedNotification);
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
