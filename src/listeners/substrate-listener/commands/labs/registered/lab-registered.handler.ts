import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LabRegisteredCommand } from './lab-registered.command';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  DebioNotificationService,
  TransactionLoggingService,
} from '../../../../../common';
import { NotificationDto } from '../../../../../common/modules/debio-notification/dto/notification.dto';

@Injectable()
@CommandHandler(LabRegisteredCommand)
export class LabRegisteredHandler
  implements ICommandHandler<LabRegisteredCommand>
{
  private readonly logger: Logger = new Logger(LabRegisteredCommand.name);

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly notificationService: DebioNotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: LabRegisteredCommand) {
    const lab = command.lab.normalize();
    await this.logger.log(`Lab ID: ${lab.accountId} is Registered!`);
    const stakingLogging: TransactionLoggingDto = {
      address: lab.accountId,
      amount: lab.stakeAmount,
      created_at: this.dateTimeProxy.new(),
      currency: 'DBIO',
      parent_id: BigInt(0),
      ref_number: lab.accountId,
      transaction_status: 28, // Lab Unverified
      transaction_type: 7, // Lab
    };

    try {
      const isLabHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          lab.accountId,
          28, // lab Unverified
        );
      if (!isLabHasBeenInsert) {
        await this.loggingService.create(stakingLogging);
      }

      const currDateTime = this.dateTimeProxy.new();

      const notificationInput: NotificationDto = {
        role: 'Lab',
        entity_type: 'Labs',
        entity: 'LabRegistered',
        description: `Congrats! You have been submitted your account verification.`,
        read: false,
        created_at: currDateTime,
        updated_at: currDateTime,
        deleted_at: null,
        from: lab.accountId,
        to: 'Admin',
      };

      await this.notificationService.insert(notificationInput);
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
