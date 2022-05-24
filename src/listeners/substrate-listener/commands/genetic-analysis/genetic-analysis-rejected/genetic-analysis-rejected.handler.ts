import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateTimeProxy, SubstrateService } from '../../../../../common';
import { setGeneticAnalysisOrderRefunded } from '@debionetwork/polkadot-provider';
import { GeneticAnalysisRejectedCommand } from './genetic-analysis-rejected.command';
import { NotificationService } from '../../../../../endpoints/notification/notification.service';
import { NotificationDto } from '../../../../../endpoints/notification/dto/notification.dto';

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
    await this.logger.log('Genetic Analysis Rejected!');

    const geneticAnalysis = command.geneticAnalysis.normalize();

    try {
      await setGeneticAnalysisOrderRefunded(
        this.substrateService.api as any,
        this.substrateService.pair,
        geneticAnalysis.geneticAnalysisOrderId,
        async () => {
          const orderRefundedNotification: NotificationDto = {
            role: 'Customer',
            entity_type: 'Genetic Analysis Tracking',
            entity: 'Order Rejected',
            description: `Your sample from ${geneticAnalysis.geneticAnalysisOrderId} has been rejected. Click here to see your order details.`,
            read: false,
            created_at: this.dateTimeProxy.new(),
            updated_at: this.dateTimeProxy.new(),
            deleted_at: null,
            from: 'Debio Network',
            to: geneticAnalysis.ownerId,
          };

          this.notificationService.insert(orderRefundedNotification);
        },
      );
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
