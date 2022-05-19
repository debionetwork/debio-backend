import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  TransactionLoggingService,
} from '../../../../../common';
import { GeneticAnalysisOrderCreatedCommand } from './genetic-analysis-order-created.command';
import { NotificationService } from '../../../../../endpoints/notification/notification.service';
import { NotificationDto } from '../../../../../endpoints/notification/dto/notification.dto';

@Injectable()
@CommandHandler(GeneticAnalysisOrderCreatedCommand)
export class GeneticAnalysisOrderCreatedHandler
  implements ICommandHandler<GeneticAnalysisOrderCreatedCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalysisOrderCreatedCommand.name,
  );
  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: GeneticAnalysisOrderCreatedCommand) {
    await this.logger.log('Genetic Analysis Order Created!');

    const geneticAnalysisOrder = command.geneticAnalysisOrders.normalize();

    try {
      const isGeneticAnalysisOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalysisOrder.id,
          13,
        );

      const geneticAnalysisOrderLogging: TransactionLoggingDto = {
        address: geneticAnalysisOrder.customerId,
        amount: 0,
        created_at: geneticAnalysisOrder.createdAt,
        currency: geneticAnalysisOrder.currency.toUpperCase(),
        parent_id: BigInt(0),
        ref_number: geneticAnalysisOrder.id,
        transaction_status: 13,
        transaction_type: 3,
      };

      const customerNotificationInput: NotificationDto = {
        role: 'Customer',
        entity_type: 'Genetic Analysis Orders',
        entity: 'Order Created',
        description: `You've successfully submitted your requested test for ${geneticAnalysisOrder.id}.`,
        read: false,
        created_at: await this.dateTimeProxy.new(),
        updated_at: await this.dateTimeProxy.new(),
        deleted_at: null,
        from: 'Debio Network',
        to: geneticAnalysisOrder.customerId,
      };

      if (!isGeneticAnalysisOrderHasBeenInsert) {
        await this.loggingService.create(geneticAnalysisOrderLogging);
        await this.notificationService.insert(customerNotificationInput);
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
