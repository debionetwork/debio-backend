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
    const geneticAnalyst =
      command.geneticAnalyst.humanToGeneticAnalystListenerData();

    await this.logger.log(
      `Genetic Analyst Verification Status ${geneticAnalyst.verification_status}!`,
    );

    try {
      const isGeneticAnalystHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalyst.account_id,
          21,
        );
      const geneticAnalystHistory =
        await this.loggingService.getLoggingByOrderId(
          geneticAnalyst.account_id,
        );
      let transactionStatus;

      if (geneticAnalyst.verification_status === 'Verified') {
        transactionStatus = 20;
      }
      if (geneticAnalyst.verification_status === 'Rejected') {
        transactionStatus = 21;
      }
      if (geneticAnalyst.verification_status === 'Revoked') {
        transactionStatus = 22;
      }

      const geneticAnalystLogging: TransactionLoggingDto = {
        address: geneticAnalyst.account_id,
        amount: geneticAnalystHistory.amount,
        created_at: new Date(this.dateTimeProxy.now()),
        currency: 'DBIO',
        parent_id: BigInt(geneticAnalystHistory.id),
        ref_number: geneticAnalyst.account_id,
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
