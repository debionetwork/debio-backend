import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import { TransactionLoggingService } from '../../../../../common';
import { GeneticAnalysisOrderCreatedCommand } from './genetic-analysis-order-created.command';

@Injectable()
@CommandHandler(GeneticAnalysisOrderCreatedCommand)
export class GeneticAnalysisOrderCreatedHandler
  implements ICommandHandler<GeneticAnalysisOrderCreatedCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalysisOrderCreatedCommand.name,
  );
  constructor(private readonly loggingService: TransactionLoggingService) {}

  async execute(command: GeneticAnalysisOrderCreatedCommand) {
    await this.logger.log('Genetic Analysis Order Created!');

    const geneticAnalysisOrder =
      command.geneticAnalysisOrders.humanToGeneticAnalysisOrderListenerData();

    try {
      const isGeneticAnalysisOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalysisOrder.id,
          13,
        );

      const geneticAnalysisOrderLogging: TransactionLoggingDto = {
        address: geneticAnalysisOrder.customer_id,
        amount: 0,
        created_at: geneticAnalysisOrder.created_at,
        currency: geneticAnalysisOrder.currency.toUpperCase(),
        parent_id: BigInt(0),
        ref_number: geneticAnalysisOrder.id,
        transaction_status: 13,
        transaction_type: 3,
      };

      if (!isGeneticAnalysisOrderHasBeenInsert) {
        await this.loggingService.create(geneticAnalysisOrderLogging);
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
