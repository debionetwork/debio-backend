import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateTimeProxy } from '../../../../../common';
import { ServiceRequestStakingAmountRefundedCommand } from './service-request-staking-amount-refunded.command';
import { NotificationService } from '../../../../../endpoints/notification/notification.service';
import { NotificationDto } from '../../../../../endpoints/notification/dto/notification.dto';

@Injectable()
@CommandHandler(ServiceRequestStakingAmountRefundedCommand)
export class ServiceRequestStakingAmountRefundedHandler
  implements ICommandHandler<ServiceRequestStakingAmountRefundedCommand>
{
  constructor(
    private readonly dateTimeProxy: DateTimeProxy,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(command: ServiceRequestStakingAmountRefundedCommand) {
    const { requesterId, requestId } = command;

    const refundedNotification: NotificationDto = {
      role: 'Customer',
      entity_type: 'Request Service Staking',
      entity: 'Requested Service Unstaked',
      description: `Your stake amount from staking ID ${requestId} has been refunded, kindly check your balance.`,
      read: false,
      created_at: this.dateTimeProxy.new(),
      updated_at: this.dateTimeProxy.new(),
      deleted_at: null,
      from: 'Debio Network',
      to: requesterId,
    };

    this.notificationService.insert(refundedNotification);
  }
}
