import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderFailedCommand } from './order-failed.command';
import { EscrowService } from '../../../../../common/modules/escrow/escrow.service';
import { DateTimeProxy, SubstrateService } from '../../../../../common';
import {
  Order,
  setOrderRefunded,
  finalizeRequest,
  sendRewards,
} from '@debionetwork/polkadot-provider';
import { NotificationDto } from '../../../../../endpoints/notification/dto/notification.dto';
import { NotificationService } from '../../../../../endpoints/notification/notification.service';

@Injectable()
@CommandHandler(OrderFailedCommand)
export class OrderFailedHandler implements ICommandHandler<OrderFailedCommand> {
  private readonly logger: Logger = new Logger(OrderFailedCommand.name);

  constructor(
    private readonly escrowService: EscrowService,
    private readonly substrateService: SubstrateService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: OrderFailedCommand) {
    await this.logger.log('OrderFailed!');

    const order: Order = command.orders;
    order.normalize();

    if (order.orderFlow === 'StakingRequestService') {
      await finalizeRequest(
        this.substrateService.api as any,
        this.substrateService.pair,
        order.id,
        false,
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
    const rewardCustomer = +order.additionalPrices[0].value * 10 ** 18;
    const rewardLab = rewardCustomer / 10;
    //send reward for customer
    sendRewards(
      this.substrateService.api as any,
      this.substrateService.pair,
      order.customerId,
      rewardCustomer.toString(),
    );

    //send reward for customer
    sendRewards(
      this.substrateService.api as any,
      this.substrateService.pair,
      order.sellerId,
      rewardLab.toString(),
      async () => {
        // insert notification
        const labNotification: NotificationDto = {
          role: 'Lab',
          entity_type: 'Genetic Testing Order',
          entity: 'Order Failed',
          description: `You’ve got ${rewardLab} DAI from the quality control fee.`,
          read: false,
          created_at: this.dateTimeProxy.new(),
          updated_at: this.dateTimeProxy.new(),
          deleted_at: null,
          from: null,
          to: order.sellerId,
        };
        await this.notificationService.insert(labNotification);
      },
    );
  }
}
