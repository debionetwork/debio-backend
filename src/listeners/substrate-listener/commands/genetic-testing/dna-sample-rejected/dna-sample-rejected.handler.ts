import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DnaSampleRejectedCommand } from './dna-sample-rejected.command';
import { NotificationDto } from '../../../../../endpoints/notification/dto/notification.dto';
import { NotificationService } from '../../../../../endpoints/notification/notification.service';
import { DateTimeProxy } from '../../../../../common';

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

    const sampleRejectedNotification: NotificationDto = {
      role: 'Customer',
      entity_type: 'Genetic Testing Tracking',
      entity: 'QC Failed',
      description: `Your sample from ${dnaSample.trackingId} has been rejected. Click here to see your order details.`,
      read: false,
      created_at: this.dateTimeProxy.new(),
      updated_at: this.dateTimeProxy.new(),
      deleted_at: null,
      from: 'Debio Network',
      to: dnaSample.ownerId,
    };

    await this.notificationService.insert(sampleRejectedNotification);
  }
}
