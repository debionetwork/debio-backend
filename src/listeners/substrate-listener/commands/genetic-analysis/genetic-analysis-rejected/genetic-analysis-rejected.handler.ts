import { Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { setGeneticAnalysisOrderRefunded, SubstrateService } from "../../../../../common";
import { GeneticAnalysisRejectedCommand } from "./genetic-analysis-rejected.command";

@Injectable()
@CommandHandler(GeneticAnalysisRejectedCommand)
export class GeneticAnalysisRejectedHandler implements ICommandHandler<GeneticAnalysisRejectedCommand> {
  private readonly logger: Logger = new Logger(GeneticAnalysisRejectedCommand.name);
  constructor( private readonly substrateService: SubstrateService) {}

  async execute(command: GeneticAnalysisRejectedCommand) {
    await this.logger.log('Genetic Analysis Rejected!');

    const geneticAnalysis = command.geneticAnalysis.humanToGeneticAnalysisListenerData();

    try {
      await setGeneticAnalysisOrderRefunded(
        this.substrateService.api,
        this.substrateService.pair,
        geneticAnalysis.genetic_analysis_orderId
      )
    } catch (error) {
      await this.logger.log(error);
    }
  }
}