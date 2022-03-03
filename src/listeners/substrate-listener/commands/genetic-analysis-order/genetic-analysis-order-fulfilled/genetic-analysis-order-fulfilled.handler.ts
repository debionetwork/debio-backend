import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import { TransactionLoggingService } from '../../../../../common';
import { GeneticAnalysisOrderFulfilledCommand } from './genetic-analysis-order-fulfilled.command';

@Injectable()
@CommandHandler(GeneticAnalysisOrderFulfilledCommand)
export class GeneticAnalysisOrderFulfilledHandler
  implements ICommandHandler<GeneticAnalysisOrderFulfilledCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalysisOrderFulfilledCommand.name,
  );
  constructor(private readonly loggingService: TransactionLoggingService) {}

  async execute(command: GeneticAnalysisOrderFulfilledCommand) {
    await this.logger.log('Genetic Analysis Order Fulfilled!');

    const geneticAnalysisOrder =
      command.geneticAnalysisOrders.normalize();

    try {
      const isGeneticAnalysisOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalysisOrder.id,
          15,
        );
      const geneticAnalysisOrderHistory =
        await this.loggingService.getLoggingByOrderId(geneticAnalysisOrder.id);

      const geneticAnalysisOrderLogging: TransactionLoggingDto = {
        address: geneticAnalysisOrder.customerId,
        amount: geneticAnalysisOrder.prices[0].value,
        created_at: geneticAnalysisOrder.updatedAt,
        currency: geneticAnalysisOrder.currency.toUpperCase(),
        parent_id: BigInt(geneticAnalysisOrderHistory.id),
        ref_number: geneticAnalysisOrder.id,
        transaction_status: 15,
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
