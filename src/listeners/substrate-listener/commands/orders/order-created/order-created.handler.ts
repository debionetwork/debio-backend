import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderCreatedCommand } from './order-created.command';
import { TransactionLoggingService } from '../../../../../common';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';

@Injectable()
@CommandHandler(OrderCreatedCommand)
export class OrderCreatedHandler
  implements ICommandHandler<OrderCreatedCommand>
{
  private readonly logger: Logger = new Logger(OrderCreatedCommand.name);

  constructor(private readonly loggingService: TransactionLoggingService) {}

  async execute(command: OrderCreatedCommand) {
    await this.logger.log('OrderCreated!');
    const order = command.orders;
    try {
      const isOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(order.id, 1);

      order.created_at = new Date(
        Number(
          order.created_at
            .toString()
            .split(',')
            .join('')
        )
      )

      order.additional_prices[0].value = Number(
        order.additional_prices[0].value
          .toString()
          .split(',')
          .join('')
      ) / 10 ** 18;
      
      order.prices[0].value = Number(
        order.prices[0].value
          .toString()
          .split(',')
          .join('')
      ) / 10 ** 18;

      //insert logging to DB
      const orderLogging: TransactionLoggingDto = {
        address: order.customer_id,
        amount: (order.additional_prices[0].value) + order.prices[0].value,
        created_at: order.created_at,
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
}
