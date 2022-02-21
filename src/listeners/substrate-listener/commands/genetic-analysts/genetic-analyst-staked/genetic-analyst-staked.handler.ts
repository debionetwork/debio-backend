import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import { DateTimeProxy, TransactionLoggingService } from '../../../../../common';
import { GeneticAnalystStakedCommand } from './genetic-analyst-staked.command';

@Injectable()
@CommandHandler(GeneticAnalystStakedCommand)
export class GeneticAnalystStakedHandler
  implements ICommandHandler<GeneticAnalystStakedCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalystStakedCommand.name,
  );
  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly dateTimeProxy: DateTimeProxy,
    ) {}

  async execute(command: GeneticAnalystStakedCommand) {
    await this.logger.log('Genetic Analysis  Created!');

    const geneticAnalyst =
      command.geneticAnalyst.humanToGeneticAnalystListenerData();

    try {
      const isGeneticAnalystHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalyst.account_id,
          13,
        );

      const geneticAnalystLogging: TransactionLoggingDto = {
        address: geneticAnalyst.account_id,
        amount: 0,
        created_at: new Date(this.dateTimeProxy.now()),
        currency: 'DBIO',
        parent_id: BigInt(0),
        ref_number: geneticAnalyst.account_id,
        transaction_status: 19,
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
