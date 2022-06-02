import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotificationService } from '../../../../../endpoints/notification/notification.service';
import { ServiceRequestClaimedCommand } from './service-request-claimed.command';
import { DateTimeProxy } from '../../../../../common';
import { NotificationDto } from '../../../../../endpoints/notification/dto/notification.dto';

@Injectable()
@CommandHandler(ServiceRequestClaimedCommand)
export class ServiceRequestClaimedCommandHandler
  implements ICommandHandler<ServiceRequestClaimedCommand>
{
  constructor(
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: ServiceRequestClaimedCommand) {
    const requestData = command.request.normalize();

    const serviceAvailableNotificationInput: NotificationDto = {
      role: 'Customer',
      entity_type: 'Request Service Staking',
      entity: 'Requested Service Available',
      description: `Congrats! Your requested service is available now. See your stake service.`,
      read: false,
      created_at: this.dateTimeProxy.new(),
      updated_at: this.dateTimeProxy.new(),
      deleted_at: null,
      from: null,
      to: requestData.requesterAddress,
    };

    await this.notificationService.insert(serviceAvailableNotificationInput);
  }
}
