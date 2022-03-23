import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  TransactionLoggingService,
} from '../../../../../common';
import { GeneticAnalystVerificationStatusCommand } from './genetic-analyst-verification-status.command';

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
  ) {}

  async execute(command: GeneticAnalystVerificationStatusCommand) {
    const geneticAnalyst = command.geneticAnalyst.normalize();

    await this.logger.log(
      `Genetic Analyst Verification Status ${geneticAnalyst.verificationStatus}!`,
    );

    try {
      const isGeneticAnalystHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalyst.accountId,
          21,
        );
      const geneticAnalystHistory =
        await this.loggingService.getLoggingByOrderId(geneticAnalyst.accountId);
      let transactionStatus;

      if (geneticAnalyst.verificationStatus === 'Verified') {
        transactionStatus = 20;
      }
      if (geneticAnalyst.verificationStatus === 'Rejected') {
        transactionStatus = 21;
      }
      if (geneticAnalyst.verificationStatus === 'Revoked') {
        transactionStatus = 22;
      }

      const geneticAnalystLogging: TransactionLoggingDto = {
        address: geneticAnalyst.accountId,
        amount: geneticAnalystHistory.amount,
        created_at: new Date(this.dateTimeProxy.now()),
        currency: 'DBIO',
        parent_id: BigInt(geneticAnalystHistory.id),
        ref_number: geneticAnalyst.accountId,
        transaction_status: transactionStatus,
        transaction_type: 4,
      };

      if (!isGeneticAnalystHasBeenInsert) {
        await this.loggingService.create(geneticAnalystLogging);
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
