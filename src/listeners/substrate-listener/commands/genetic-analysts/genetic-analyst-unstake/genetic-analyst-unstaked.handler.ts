import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  TransactionLoggingService,
} from '../../../../../common';
import { GeneticAnalystUnstakedCommand } from './genetic-analyst-unstaked.command';

@Injectable()
@CommandHandler(GeneticAnalystUnstakedCommand)
export class GeneticAnalystUnstakedHandler
  implements ICommandHandler<GeneticAnalystUnstakedCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalystUnstakedCommand.name,
  );
  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: GeneticAnalystUnstakedCommand) {
    await this.logger.log('Genetic Analyst Unstaked!');

    const geneticAnalyst = command.geneticAnalyst.normalize();

    try {
      const isGeneticAnalystHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalyst.accountId,
          19,
        );

      const geneticAnalystLogging: TransactionLoggingDto = {
        address: geneticAnalyst.accountId,
        amount: isGeneticAnalystHasBeenInsert.amount,
        created_at: new Date(this.dateTimeProxy.now()),
        currency: 'DBIO',
        parent_id: BigInt(Number(isGeneticAnalystHasBeenInsert.id)),
        ref_number: geneticAnalyst.accountId,
        transaction_status: 24,
        transaction_type: 5,
      };

      await this.loggingService.create(geneticAnalystLogging);
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
