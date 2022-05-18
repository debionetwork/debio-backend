import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateTimeProxy, SubstrateService } from '../../../../../common';
import { setGeneticAnalysisOrderFulfilled } from '@debionetwork/polkadot-provider';
import { GeneticAnalysisResultReadyCommand } from './genetic-analysis-result-ready.command';
import { NotificationService } from '../../../../../endpoints/notification/notification.service';
import { NotificationDto } from '../../../../../endpoints/notification/dto/notification.dto';

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
    await this.logger.log('Genetic Analysis Result Ready!');

    const geneticAnalysis = command.geneticAnalysis.normalize();
    // Write Logging Notification Customer Reward From Request Service
    const customerNotificationInput: NotificationDto = {
      role: 'Customer',
      entity_type: 'Genetic Analysis Tracking',
      entity: 'Order Fulfilled',
      description: `Congrats! Your DNA results for ${geneticAnalysis.geneticAnalysisOrderId} are out. Click here to see your order details.`,
      read: false,
      created_at: await this.dateTimeProxy.new(),
      updated_at: await this.dateTimeProxy.new(),
      deleted_at: null,
      from: 'Debio Network',
      to: geneticAnalysis.ownerId,
    };

    try {
      await setGeneticAnalysisOrderFulfilled(
        this.substrateService.api as any,
        this.substrateService.pair,
        geneticAnalysis.geneticAnalysisOrderId,
        () => this.callbackInsertNotificationLogging(customerNotificationInput),
      );
    } catch (error) {
      await this.logger.log(error);
    }
  }

  callbackInsertNotificationLogging(data: NotificationDto) {
    this.notificationService.insert(data);
  }
}
