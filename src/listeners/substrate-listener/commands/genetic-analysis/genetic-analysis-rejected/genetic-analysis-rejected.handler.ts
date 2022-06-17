import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DateTimeProxy,
  NotificationService,
  SubstrateService,
} from '../../../../../common';
import { setGeneticAnalysisOrderRefunded } from '@debionetwork/polkadot-provider';
import { GeneticAnalysisRejectedCommand } from './genetic-analysis-rejected.command';
import { NotificationDto } from '../../../../../common/modules/notification/dto/notification.dto';

@Injectable()
@CommandHandler(GeneticAnalysisRejectedCommand)
export class GeneticAnalysisRejectedHandler
  implements ICommandHandler<GeneticAnalysisRejectedCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalysisRejectedCommand.name,
  );
  constructor(
    private readonly substrateService: SubstrateService,
    private readonly dateTimeProxy: DateTimeProxy,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(command: GeneticAnalysisRejectedCommand) {
    const geneticAnalysis = command.geneticAnalysis.normalize();
    await this.logger.log(
      `Genetic Analysis Rejected With Tracking ID: ${geneticAnalysis.geneticAnalysisTrackingId}!`,
    );

    try {
      await setGeneticAnalysisOrderRefunded(
        this.substrateService.api as any,
        this.substrateService.pair,
        geneticAnalysis.geneticAnalysisOrderId,
      );

      const currDate = this.dateTimeProxy.new();

      const orderRefundedNotification: NotificationDto = {
        role: 'Customer',
        entity_type: 'Genetic Analysis Tracking',
        entity: 'Order Rejected',
        description: `Your sample from ${geneticAnalysis.geneticAnalysisOrderId} has been rejected. Click here to see your order details.`,
        read: false,
        created_at: currDate,
        updated_at: currDate,
        deleted_at: null,
        from: 'Debio Network',
        to: geneticAnalysis.ownerId,
      };

      await this.notificationService.insert(orderRefundedNotification);
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
