import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderFailedCommand } from './order-failed.command';
import { ethers } from 'ethers';
import { EscrowService } from '../../../../../common/modules/escrow/escrow.service';
import { refundOrder, SubstrateService } from '../../../../../common';

@Injectable()
@CommandHandler(OrderFailedCommand)
export class OrderFailedHandler implements ICommandHandler<OrderFailedCommand> {
  private readonly logger: Logger = new Logger(OrderFailedCommand.name);

  constructor(
    private readonly escrowService: EscrowService,
    private readonly substrateService: SubstrateService,
  ) {}

  async execute(command: OrderFailedCommand) {
    await this.logger.log('OrderFailed!');

    const order = command.orders;
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

    await this.escrowService.refundOrder(order.id);
    await refundOrder(
      this.substrateService.api,
      this.substrateService.pair,
      order.id,
    );
  }
}
