import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderFailedCommand } from './order-failed.command';
import { EscrowService } from '../../../../../common/modules/escrow/escrow.service';
import {
  setOrderRefunded,
  SubstrateService,
  finalizeRequest,
  sendRewards,
  Order,
} from '../../../../../common';

@Injectable()
@CommandHandler(OrderFailedCommand)
export class OrderFailedHandler implements ICommandHandler<OrderFailedCommand> {
  private readonly logger: Logger = new Logger(OrderFailedCommand.name);
  private _orderInput:  Order;

  constructor(
    private readonly escrowService: EscrowService,
    private readonly substrateService: SubstrateService,
  ) {}

  async execute(command: OrderFailedCommand) {
    const order = command.orders.humanToOrderListenerData();
    this._orderInput = order
    await this.logger.log(`${order.order_flow} OrderFailed!`);

    if (order.order_flow === 'StakingRequestService') {
      await finalizeRequest(
        this.substrateService.api,
        this.substrateService.pair,
        order.id,
        'No',
        this.callbackSendReward
        );
      
    } else {
      await this.escrowService.refundOrder(order.id);
      await setOrderRefunded(
        this.substrateService.api,
        this.substrateService.pair,
        order.id,
      );
    }
  }

  async callbackSendReward() {
    //send reward for customer
    await sendRewards(
      this.substrateService.api,
      this.substrateService.pair,
      this._orderInput.customer_id,
      (this._orderInput.additional_prices[0].value * 10**18).toString(),
    )

    //send reward for customer
    await sendRewards(
      this.substrateService.api,
      this.substrateService.pair,
      this._orderInput.seller_id,
      (this._orderInput.additional_prices[0].value * 10**18 / 10).toString(),
    )
  }
}
