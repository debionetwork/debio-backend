import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateTimeProxy, SubstrateService } from '../../../../../common';
import { setGeneticAnalysisOrderFulfilled } from '@debionetwork/polkadot-provider';
import { GeneticAnalysisResultReadyCommand } from './genetic-analysis-result-ready.command';
import { NotificationDto } from '../../../../../endpoints/notification/dto/notification.dto';
import { NotificationService } from '../../../../../endpoints/notification/notification.service';

@Injectable()
@CommandHandler(GeneticAnalysisResultReadyCommand)
export class GeneticAnalysisResultReadyHandler
  implements ICommandHandler<GeneticAnalysisResultReadyCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalysisResultReadyCommand.name,
  );
  constructor(
    private readonly substrateService: SubstrateService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
    ) {}

  async execute(command: GeneticAnalysisResultReadyCommand) {
    const geneticAnalysis = command.geneticAnalysis.normalize();
    await this.logger.log(
      `Genetic Analysis Result Ready With Tracking ID: ${geneticAnalysis.geneticAnalysisTrackingId}!`,
    );
    
    const notificationInput: NotificationDto = {
      role: 'Customer',
      entity_type: 'Genetic Analysis Tracking',
      entity: 'Order Fulfilled',
      description: `Your Genetic Analysis results for ${geneticAnalysis.geneticAnalysisOrderId} are out. Click here to see your order details.`,
      read: false,
      created_at: await this.dateTimeProxy.new(),
      updated_at: await this.dateTimeProxy.new(),
      deleted_at: null,
      from: geneticAnalysis.ownerId,
      to: 'Debio Network',
    };
    try {
      await setGeneticAnalysisOrderFulfilled(
        this.substrateService.api as any,
        this.substrateService.pair,
        geneticAnalysis.geneticAnalysisOrderId,
      );
      await this.notificationService.insert(notificationInput)

    } catch (error) {
      await this.logger.log(error);
    }
  }
}
