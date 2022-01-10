import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderFailedCommand } from './order-failed.command';
import { ethers } from 'ethers';
import { EscrowService } from '../../../../../endpoints/escrow/escrow.service';
import { refundOrder, SubstrateService } from '../../../../../common';

@Injectable()
@CommandHandler(OrderFailedCommand)
export class OrderFailedHandler
  implements ICommandHandler<OrderFailedCommand>
{
  constructor(
    private readonly escrowService: EscrowService,
    private readonly substrateService: SubstrateService,
    private readonly logger: Logger,
  ) {}

  async execute(command: OrderFailedCommand) {
    await this.logger.log('OrderFailed!');

    const order = command.orders;
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

    await this.escrowService.refundOrder(order.id);
    await refundOrder(
      this.substrateService.api, 
      this.substrateService.pair, 
      order.id
    );
  }
}