import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceRequestClaimedCommand } from './service-request-claimed.command';
import { DateTimeProxy, DebioNotificationService } from '../../../../../common';
import { NotificationDto } from '../../../../../common/modules/debio-notification/dto/notification.dto';

@Injectable()
@CommandHandler(ServiceRequestClaimedCommand)
export class ServiceRequestClaimedCommandHandler
  implements ICommandHandler<ServiceRequestClaimedCommand>
{
  constructor(
    private readonly notificationService: DebioNotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: ServiceRequestClaimedCommand) {
    const requestData = command.request.normalize();

    const currDateTime = this.dateTimeProxy.new();

    const serviceAvailableNotificationInput: NotificationDto = {
      role: 'Customer',
      entity_type: 'Request Service Staking',
      entity: 'Requested Service Available',
      description: `Congrats! Your requested service is available now. Click here to see your order details.`,
      read: false,
      created_at: currDateTime,
      updated_at: currDateTime,
      deleted_at: null,
      from: 'Debio Network',
      to: requestData.requesterAddress,
    };

    await this.notificationService.insert(serviceAvailableNotificationInput);
  }
}
