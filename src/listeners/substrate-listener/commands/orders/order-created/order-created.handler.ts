import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderCreatedCommand } from './order-created.command';
import { TransactionLoggingService } from '../../../../../common';
import { ethers } from 'ethers';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';

@Injectable()
@CommandHandler(OrderCreatedCommand)
export class OrderCreatedHandler
  implements ICommandHandler<OrderCreatedCommand>
{
  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly logger: Logger,
  ) {}

  async execute(command: OrderCreatedCommand) {
    await this.logger.log('OrderCreated!');

    const order = command.orders[0].toJSON();

    try {
      const isOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(order.id, 1);
      order.dnaSampleTrackingId = ethers.utils.toUtf8String(
        order.dnaSampleTrackingId,
      );
      order.additionalPrices[0].value =
        Number(order.additionalPrices[0].value) / 10 ** 18;
      order.additionalPrices[0].component = ethers.utils.toUtf8String(
        order.additionalPrices[0].component,
      );
      order.prices[0].value = Number(order.prices[0].value) / 10 ** 18;
      order.prices[0].component = ethers.utils.toUtf8String(
        order.prices[0].component,
      );

      //insert logging to DB
      const orderLogging: TransactionLoggingDto = {
        address: order.customerId,
        amount: order.additionalPrices[0].value + order.prices[0].value,
        created_at: new Date(parseInt(order.createdAt)),
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
