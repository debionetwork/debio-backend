import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderCancelledCommand } from './order-cancelled.command';
import { TransactionLoggingService } from '../../../../../common';
import { EscrowService } from '../../../../../common/modules/escrow/escrow.service';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';

@Injectable()
@CommandHandler(OrderCancelledCommand)
export class OrderCancelledHandler
  implements ICommandHandler<OrderCancelledCommand>
{
  private readonly logger: Logger = new Logger(OrderCancelledCommand.name);

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly escrowService: EscrowService,
  ) {}

  async execute(command: OrderCancelledCommand) {
    await this.logger.log('OrderCancelled');
    const order = command.orders;
    try {
      const isOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(order.id, 5);

        order.updated_at = new Date(
        Number(
          order.updated_at
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

      const orderHistory = await this.loggingService.getLoggingByOrderId(
        order.id,
      );
      //Logging data Input
      const orderLogging: TransactionLoggingDto = {
        address: order.customer_id,
        amount: order.additional_prices[0].value + order.prices[0].value,
        created_at: order.updated_at,
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
}
