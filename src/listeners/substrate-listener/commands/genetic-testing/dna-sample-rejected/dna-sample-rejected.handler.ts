import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DnaSampleRejectedCommand } from './dna-sample-rejected.command';
import { NotificationDto } from '../../../../../common/modules/notification/dto/notification.dto';
import { DateTimeProxy, NotificationService } from '../../../../../common';

@Injectable()
@CommandHandler(DnaSampleRejectedCommand)
export class DnaSampleRejectedCommandHandler
  implements ICommandHandler<DnaSampleRejectedCommand>
{
  constructor(
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: DnaSampleRejectedCommand) {
    const dnaSample = command.dnaSample;

    const currDateTime = this.dateTimeProxy.new();

    const sampleRejectedNotification: NotificationDto = {
      role: 'Customer',
      entity_type: 'Genetic Testing Tracking',
      entity: 'QC Failed',
      description: `Your sample from ${dnaSample.trackingId} has been rejected. Click here to see your order details.`,
      read: false,
      created_at: currDateTime,
      updated_at: currDateTime,
      deleted_at: null,
      from: 'Debio Network',
      to: dnaSample.ownerId,
    };

    await this.notificationService.insert(sampleRejectedNotification);
  }
}
