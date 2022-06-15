import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DateTimeProxy,
} from '../../../../../common';
import { LabUpdateVerificationStatusCommand } from './update-verification-status.command';
import { NotificationDto } from '../../../../../endpoints/notification/dto/notification.dto';
import { NotificationService } from '../../../../../endpoints/notification/notification.service';
@Injectable()
@CommandHandler(LabUpdateVerificationStatusCommand)
export class LabUpdateVerificationStatusHandler
  implements ICommandHandler<LabUpdateVerificationStatusCommand>
{
  private readonly logger: Logger = new Logger(LabUpdateVerificationStatusCommand.name);
  constructor(
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: LabUpdateVerificationStatusCommand) {
    const lab = command.labs.normalize();
    await this.logger.log(`Lab ID: ${lab.accountId} Update Verification Status ${lab.verificationStatus}!`);

    const notificationInput: NotificationDto = {
      role: 'Lab',
      entity_type: 'Verification',
      entity: `Account ${lab.verificationStatus}`,
      description: `Your account has been ${lab.verificationStatus.toLowerCase()}.`,
      read: false,
      created_at: await this.dateTimeProxy.new(),
      updated_at: await this.dateTimeProxy.new(),
      deleted_at: null,
      from: 'Debio Network',
      to: lab.accountId,
    };

    if(lab.verificationStatus == 'Verified'){
      notificationInput.description = 'Congrats! ' + notificationInput.description;
    }
    try {
      await this.notificationService.insert(notificationInput)
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
