import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DnaSampleResultReadyCommand } from './dna-sample-result-ready.command';
import { NotificationDto } from '../../../../../endpoints/notification/dto/notification.dto';
import { NotificationService } from '../../../../../endpoints/notification/notification.service';
import { DateTimeProxy } from '../../../../../common';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(DnaSampleResultReadyCommand)
export class DnaSampleResultReadyCommandHandler
  implements ICommandHandler<DnaSampleResultReadyCommand>
{
  constructor(
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: DnaSampleResultReadyCommand) {
    const dnaSample = command.dnaSample;

    const testResultNotification: NotificationDto = {
      role: 'Customer',
      entity_type: 'Genetic Testing Tracking',
      entity: 'Order Fulfilled',
      description: `Congrats! Your test results for ${dnaSample.orderId} are out. See your test details.`,
      read: false,
      created_at: this.dateTimeProxy.new(),
      updated_at: this.dateTimeProxy.new(),
      deleted_at: null,
      from: null,
      to: dnaSample.ownerId,
    };

    await this.notificationService.insert(testResultNotification);
  }
}
