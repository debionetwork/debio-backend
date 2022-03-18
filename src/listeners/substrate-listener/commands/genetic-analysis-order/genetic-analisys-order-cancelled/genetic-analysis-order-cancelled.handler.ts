import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import { TransactionLoggingService } from '../../../../../common';
import { GeneticAnalysisOrderCancelledCommand } from './genetic-analysis-order-cancelled.command';

@Injectable()
@CommandHandler(GeneticAnalysisOrderCancelledCommand)
export class GeneticAnalysisOrderCancelledHandler
  implements ICommandHandler<GeneticAnalysisOrderCancelledCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalysisOrderCancelledCommand.name,
  );
  constructor(private readonly loggingService: TransactionLoggingService) {}

  async execute(command: GeneticAnalysisOrderCancelledCommand) {
    await this.logger.log('Genetic Analysis Order Cancelled!');

    const geneticAnalysisOrder = command.geneticAnalysisOrders.normalize();

    try {
      const isGeneticAnalysisOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalysisOrder.id,
          17,
        );

      const isGeneticAnalysisOrderPaid =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalysisOrder.id,
          14, 
        )

      const geneticAnalysisOrderHistory =
        await this.loggingService.getLoggingByOrderId(geneticAnalysisOrder.id);

      const geneticAnalysisOrderLogging: TransactionLoggingDto = {
        address: geneticAnalysisOrder.customerId,
        amount: geneticAnalysisOrder.prices[0].value,
        created_at: geneticAnalysisOrder.updatedAt,
        currency: geneticAnalysisOrder.currency.toUpperCase(),
        parent_id: BigInt(geneticAnalysisOrderHistory.id),
        ref_number: geneticAnalysisOrder.id,
        transaction_status: 17,
        transaction_type: 3,
      };

      if (!isGeneticAnalysisOrderHasBeenInsert) {
        await this.loggingService.create(geneticAnalysisOrderLogging);
        if (isGeneticAnalysisOrderPaid) {
          //TODO -> Hit pallet unretrieve Genetic Analysis Order
        }
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
