import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderRefundedCommand } from './order-refunded.command';
import { ethers } from 'ethers';
import { TransactionLoggingService } from '../../../../../common';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';

@Injectable()
@CommandHandler(OrderRefundedCommand)
export class OrderRefundedHandler
  implements ICommandHandler<OrderRefundedCommand>
{
  private readonly logger: Logger = new Logger(OrderRefundedCommand.name);

  constructor(private readonly loggingService: TransactionLoggingService) {}

  async execute(command: OrderRefundedCommand) {
    await this.logger.log('OrderRefunded!');

    const order = command.orders;

    try {
      const isOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(order.id, 4);
      order.dna_sample_tracking_id = ethers.utils.toUtf8String(
        order.dna_sample_tracking_id,
      );
      order.additional_prices[0].value =
        Number(order.additional_prices[0].value) / 10 ** 18;
      order.additional_prices[0].component = ethers.utils.toUtf8String(
        order.additional_prices[0].component,
      );
      order.prices[0].value = Number(order.prices[0].value) / 10 ** 18;
      order.prices[0].component = ethers.utils.toUtf8String(
        order.prices[0].component,
      );

      const orderHistory = await this.loggingService.getLoggingByOrderId(
        order.id,
      );

      //insert logging to DB
      const orderLogging: TransactionLoggingDto = {
        address: order.customer_id,
        amount: order.prices[0].value,
        created_at: order.updated_at,
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
}
