import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderFailedCommand } from './order-failed.command';
import { EscrowService } from '../../../../../common/modules/escrow/escrow.service';
import { SubstrateService } from '../../../../../common';
import {
  Order,
  setOrderRefunded,
  finalizeRequest,
  sendRewards,
} from '@debionetwork/polkadot-provider';

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

    if (order.orderFlow === 'StakingRequestService') {
      await finalizeRequest(
        this.substrateService.api,
        this.substrateService.pair,
        order.id,
        'No',
        () => this.callbackSendReward(order),
      );
    }

    await this.escrowService.refundOrder(order.id);
    await setOrderRefunded(
      this.substrateService.api as any,
      this.substrateService.pair,
      order.id,
    );
  }

  callbackSendReward(order: Order): void {
    //send reward for customer
    sendRewards(
      this.substrateService.api,
      this.substrateService.pair,
      order.customerId,
      (+order.additionalPrices[0].value * 10 ** 18).toString(),
    );

    //send reward for customer
    sendRewards(
      this.substrateService.api,
      this.substrateService.pair,
      order.sellerId,
      ((+order.additionalPrices[0].value * 10 ** 18) / 10).toString(),
    );
  }
}
