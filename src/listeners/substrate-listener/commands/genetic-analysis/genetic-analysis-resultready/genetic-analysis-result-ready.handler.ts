import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubstrateService } from '../../../../../common';
import { setGeneticAnalysisOrderFulfilled } from '@debionetwork/polkadot-provider';
import { GeneticAnalysisResultReadyCommand } from './genetic-analysis-result-ready.command';

@Injectable()
@CommandHandler(GeneticAnalysisResultReadyCommand)
export class GeneticAnalysisResultReadyHandler
  implements ICommandHandler<GeneticAnalysisResultReadyCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalysisResultReadyCommand.name,
  );
  constructor(private readonly substrateService: SubstrateService) {}

  async execute(command: GeneticAnalysisResultReadyCommand) {
    await this.logger.log('Genetic Analysis Result Ready!');

    const geneticAnalysis = command.geneticAnalysis.normalize();

    try {
      await setGeneticAnalysisOrderFulfilled(
        this.substrateService.api as any,
        this.substrateService.pair,
        geneticAnalysis.geneticAnalysisOrderId,
      );
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
