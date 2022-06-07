import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderCancelledCommand } from './order-cancelled.command';
import { TransactionLoggingService } from '../../../../../common';
import { EscrowService } from '../../../../../common/modules/escrow/escrow.service';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import { Order } from '@debionetwork/polkadot-provider';

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
    const order: Order = command.orders;
    order.normalize();
    await this.logger.log(`OrderCancelled With Order ID: ${order.id}!`);

    try {
      const isOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(order.id, 5);

      const orderHistory = await this.loggingService.getLoggingByOrderId(
        order.id,
      );
      //Logging data Input
      const orderLogging: TransactionLoggingDto = {
        address: order.customerId,
        amount: +order.additionalPrices[0].value + +order.prices[0].value,
        created_at: order.updatedAt,
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
