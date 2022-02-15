import { Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TransactionLoggingService } from "../../../../../common";
import { GeneticAnalysisOrderPaidCommand } from "./genetic-analysis-order-paid.command";

@Injectable()
@CommandHandler(GeneticAnalysisOrderPaidCommand)
export class GeneticAnalysisOrderPaidHandler implements ICommandHandler<GeneticAnalysisOrderPaidCommand> {
  private readonly logger: Logger = new Logger(GeneticAnalysisOrderPaidCommand.name);
  constructor( private readonly loggingService: TransactionLoggingService) {}

  async execute(command: GeneticAnalysisOrderPaidCommand) {
    await this.logger.log('Genetic Analysis Order Paid!');

    const geneticAnalysisOrder = command.geneticAnalysisOrders.humanToOrderListenerData()
  }
}