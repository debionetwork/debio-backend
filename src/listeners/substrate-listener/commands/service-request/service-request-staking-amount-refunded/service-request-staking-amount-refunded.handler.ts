import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateTimeProxy, DebioNotificationService } from '../../../../../common';
import { ServiceRequestStakingAmountRefundedCommand } from './service-request-staking-amount-refunded.command';
import { NotificationDto } from '../../../../../common/modules/debio-notification/dto/notification.dto';

@Injectable()
@CommandHandler(ServiceRequestStakingAmountRefundedCommand)
export class ServiceRequestStakingAmountRefundedHandler
  implements ICommandHandler<ServiceRequestStakingAmountRefundedCommand>
{
  constructor(
    private readonly dateTimeProxy: DateTimeProxy,
    private readonly notificationService: DebioNotificationService,
  ) {}

  async execute(command: ServiceRequestStakingAmountRefundedCommand) {
    const { requesterId, requestId } = command;

    const currDateTime = this.dateTimeProxy.new();

    const refundedNotification: NotificationDto = {
      role: 'Customer',
      entity_type: 'Request Service Staking',
      entity: 'Requested Service Unstaked',
      description: `Your staked amount from staking ID ${requestId} has been refunded, kindly check your balance.`,
      read: false,
      created_at: currDateTime,
      updated_at: currDateTime,
      deleted_at: null,
      from: 'Debio Network',
      to: requesterId,
    };

    this.notificationService.insert(refundedNotification);
  }
}
