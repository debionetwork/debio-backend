import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  NotificationService,
  TransactionLoggingService,
} from '../../../../../common';
import { GeneticAnalystVerificationStatusCommand } from './genetic-analyst-verification-status.command';
import { NotificationDto } from '../../../../../common/modules/notification/dto/notification.dto';

@Injectable()
@CommandHandler(GeneticAnalystVerificationStatusCommand)
export class GeneticAnalystVerificationStatusHandler
  implements ICommandHandler<GeneticAnalystVerificationStatusCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalystVerificationStatusCommand.name,
  );
  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly dateTimeProxy: DateTimeProxy,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(command: GeneticAnalystVerificationStatusCommand) {
    let notificationDescription = '';
    let entity = '';
    const geneticAnalyst = command.geneticAnalyst.normalize();

    await this.logger.log(
      `Genetic Analyst ID: ${geneticAnalyst.accountId} Verify Status ${geneticAnalyst.verificationStatus}!`,
    );

    try {
      const isGeneticAnalystHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalyst.accountId,
          21,
        );
      let transactionStatus;

      if (geneticAnalyst.verificationStatus === 'Verified') {
        transactionStatus = 20;
        entity = 'Account verified';
        notificationDescription = 'Congrats! Your account has been verified.';
      }
      if (geneticAnalyst.verificationStatus === 'Rejected') {
        transactionStatus = 21;
        entity = 'Account rejected';
        notificationDescription =
          'Your account verification has been rejected.';
      }
      if (geneticAnalyst.verificationStatus === 'Revoked') {
        transactionStatus = 22;
        entity = 'Account revoked';
        notificationDescription = 'Your account has been revoked.';
      }

      if (!isGeneticAnalystHasBeenInsert) {
        const geneticAnalystHistory =
          await this.loggingService.getLoggingByOrderId(
            geneticAnalyst.accountId,
          );

        const geneticAnalystLogging: TransactionLoggingDto = {
          address: geneticAnalyst.accountId,
          amount: geneticAnalystHistory?.amount ?? 0,
          created_at: new Date(this.dateTimeProxy.now()),
          currency: 'DBIO',
          parent_id: BigInt(geneticAnalystHistory?.id ?? 0),
          ref_number: geneticAnalyst.accountId,
          transaction_status: transactionStatus,
          transaction_type: 4,
        };

        await this.loggingService.create(geneticAnalystLogging);
      }

      const currDate = this.dateTimeProxy.new();

      const geneticAnalystNotification: NotificationDto = {
        role: 'GA',
        entity_type: 'Verification',
        entity: entity,
        description: notificationDescription,
        read: false,
        created_at: currDate,
        updated_at: currDate,
        deleted_at: null,
        from: 'Debio Network',
        to: geneticAnalyst.accountId,
      };

      await this.notificationService.insert(geneticAnalystNotification);
    } catch (error) {
      console.log(error);
      await this.logger.log(error);
    }
  }
}
