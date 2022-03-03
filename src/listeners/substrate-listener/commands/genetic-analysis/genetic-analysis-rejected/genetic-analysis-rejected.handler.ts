import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  SubstrateService,
} from '../../../../../common';
import {
  setGeneticAnalysisOrderRefunded,
} from '@debionetwork/polkadot-provider';
import { GeneticAnalysisRejectedCommand } from './genetic-analysis-rejected.command';

@Injectable()
@CommandHandler(GeneticAnalysisRejectedCommand)
export class GeneticAnalysisRejectedHandler
  implements ICommandHandler<GeneticAnalysisRejectedCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalysisRejectedCommand.name,
  );
  constructor(private readonly substrateService: SubstrateService) {}

  async execute(command: GeneticAnalysisRejectedCommand) {
    await this.logger.log('Genetic Analysis Rejected!');

    const geneticAnalysis =
      command.geneticAnalysis.normalize();

    try {
      await setGeneticAnalysisOrderRefunded(
        this.substrateService.api as any,
        this.substrateService.pair,
        geneticAnalysis.geneticAnalysisOrderId,
      );
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
