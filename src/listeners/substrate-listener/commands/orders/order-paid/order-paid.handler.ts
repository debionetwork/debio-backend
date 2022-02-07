import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderPaidCommand } from './order-paid.command';
import { ethers } from 'ethers';
import { TransactionLoggingService } from '../../../../../common';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';

@Injectable()
@CommandHandler(OrderPaidCommand)
export class OrderPaidHandler implements ICommandHandler<OrderPaidCommand> {
  private readonly logger: Logger = new Logger(OrderPaidCommand.name);

  constructor(private readonly loggingService: TransactionLoggingService) {}

  async execute(command: OrderPaidCommand) {
    await this.logger.log('OrderPaid!');

    const order = command.orders;

    try {
      const isOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(order.id, 2);

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

      order.updated_at = new Date(
        Number(
          order.updated_at
            .toString()
            .split(',')
            .join('')
        )
      )  

      const orderHistory = await this.loggingService.getLoggingByOrderId(
        order.id,
      );

      //insert logging to DB
      const orderLogging: TransactionLoggingDto = {
        address: order.customer_id,
        amount: order.additional_prices[0].value + order.prices[0].value,
        created_at: order.updated_at,
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
}
