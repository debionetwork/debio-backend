import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DateTimeProxy,
  NotificationService,
  SubstrateService,
} from '../../../../../common';
import { setGeneticAnalysisOrderFulfilled } from '@debionetwork/polkadot-provider';
import { GeneticAnalysisResultReadyCommand } from './genetic-analysis-result-ready.command';
import { NotificationDto } from '../../../../../common/modules/notification/dto/notification.dto';

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
    try {
      await setGeneticAnalysisOrderFulfilled(
        this.substrateService.api as any,
        this.substrateService.pair,
        geneticAnalysis.geneticAnalysisOrderId,
      );

      const currDate = this.dateTimeProxy.new();

      const notificationInput: NotificationDto = {
        role: 'Customer',
        entity_type: 'Genetic Analysis Tracking',
        entity: 'Order Fulfilled',
        description: `Your Genetic Analysis results for ${geneticAnalysis.geneticAnalysisOrderId} are out. Click here to see your order details.`,
        read: false,
        created_at: currDate,
        updated_at: currDate,
        deleted_at: null,
        from: geneticAnalysis.ownerId,
        to: 'Debio Network',
      };

      await this.notificationService.insert(notificationInput);
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
