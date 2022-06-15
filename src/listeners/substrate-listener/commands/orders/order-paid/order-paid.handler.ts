import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderPaidCommand } from './order-paid.command';
import {
  DateTimeProxy,
  DebioNotificationService,
  TransactionLoggingService,
} from '../../../../../common';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import { Order } from '@debionetwork/polkadot-provider';
import { NotificationDto } from '../../../../../common/modules/debio-notification/dto/notification.dto';

@Injectable()
@CommandHandler(OrderPaidCommand)
export class OrderPaidHandler implements ICommandHandler<OrderPaidCommand> {
  private readonly logger: Logger = new Logger(OrderPaidCommand.name);

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly notificationService: DebioNotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: OrderPaidCommand) {
    const order: Order = command.orders;
    order.normalize();
    await this.logger.log(`OrderPaid with Order ID: ${order.id}!`);

    try {
      const isOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(order.id, 2);
      const orderHistory = await this.loggingService.getLoggingByOrderId(
        order.id,
      );

      if (!isOrderHasBeenInsert) {
        //insert logging to DB
        const orderLogging: TransactionLoggingDto = {
          address: order.customerId,
          amount: +order.additionalPrices[0].value + +order.prices[0].value,
          created_at: order.updatedAt,
          currency: order.currency.toUpperCase(),
          parent_id: BigInt(orderHistory.id),
          ref_number: order.id,
          transaction_status: 2,
          transaction_type: 1,
        };

        await this.loggingService.create(orderLogging);

        const currDateTime = this.dateTimeProxy.new();

        // notification to lab
        const notificationNewOrder: NotificationDto = {
          role: 'Lab',
          entity_type: 'Lab',
          entity: 'New Order',
          description: `A new order (${order.id}) is awaiting process.`,
          read: false,
          created_at: currDateTime,
          updated_at: currDateTime,
          deleted_at: null,
          from: 'Debio Network',
          to: order.sellerId,
        };
        await this.notificationService.insert(notificationNewOrder);
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
