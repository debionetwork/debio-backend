import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderCreatedCommand } from './order-created.command';
import {
  DateTimeProxy,
  DebioNotificationService,
  TransactionLoggingService,
} from '../../../../../common';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import { Order } from '@debionetwork/polkadot-provider';
import { NotificationDto } from '../../../../../common/modules/debio-notification/dto/notification.dto';

@Injectable()
@CommandHandler(OrderCreatedCommand)
export class OrderCreatedHandler
  implements ICommandHandler<OrderCreatedCommand>
{
  private readonly logger: Logger = new Logger(OrderCreatedCommand.name);

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly notificationService: DebioNotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: OrderCreatedCommand) {
    const order: Order = command.orders;
    order.normalize();
    await this.logger.log(`OrderCreated With Order ID: ${order.id}!`);

    try {
      const isOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(order.id, 1);

      //insert logging to DB
      const orderLogging: TransactionLoggingDto = {
        address: order.customerId,
        amount: +order.additionalPrices[0].value + +order.prices[0].value,
        created_at: order.createdAt,
        currency: order.currency.toUpperCase(),
        parent_id: BigInt(0),
        ref_number: order.id,
        transaction_status: 1,
        transaction_type: 1,
      };

      if (!isOrderHasBeenInsert) {
        await this.loggingService.create(orderLogging);

        const currDateTime = this.dateTimeProxy.new();

        // insert notification
        const notificationInput: NotificationDto = {
          role: 'Customer',
          entity_type: 'Order',
          entity: 'OrderCreated',
          description: `Congrats! Your requested test for ${order.id} has been submitted.`,
          read: false,
          created_at: currDateTime,
          updated_at: currDateTime,
          deleted_at: null,
          from: 'Debio Network',
          to: order.customerId,
        };

        await this.notificationService.insert(notificationInput);
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
