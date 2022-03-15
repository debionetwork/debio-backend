import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderFailedCommand } from './order-failed.command';
import { EscrowService } from '../../../../../common/modules/escrow/escrow.service';
import { SubstrateService } from '../../../../../common';
import { Order, setOrderRefunded } from '@debionetwork/polkadot-provider';

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

    const order: Order = command.orders;
    order.normalize();

    await this.escrowService.refundOrder(order.id);
    await setOrderRefunded(
      this.substrateService.api as any,
      this.substrateService.pair,
      order.id,
    );
  }
}
