import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import { DateTimeProxy, TransactionLoggingService } from '../../../../../common';
import { GeneticAnalysisOrderRefundedCommand } from './genetic-analysis-order-refunded.command';
import { NotificationService } from '../../../../../endpoints/notification/notification.service';
import { NotificationDto } from '../../../../../endpoints/notification/dto/notification.dto';

@Injectable()
@CommandHandler(GeneticAnalysisOrderRefundedCommand)
export class GeneticAnalysisOrderRefundedHandler
  implements ICommandHandler<GeneticAnalysisOrderRefundedCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalysisOrderRefundedCommand.name,
  );
  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
    ) {}

  async execute(command: GeneticAnalysisOrderRefundedCommand) {
    await this.logger.log('Genetic Analysis Order Refunded!');

    const geneticAnalysisOrder = command.geneticAnalysisOrders.normalize();

    try {
      const isGeneticAnalysisOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalysisOrder.id,
          16,
        );
      const geneticAnalysisOrderHistory =
        await this.loggingService.getLoggingByOrderId(geneticAnalysisOrder.id);

      const customerNotificationInput: NotificationDto = {
        role: 'Customer',
        entity_type: 'Genetic Analysis Orders',
        entity: 'Order Refunded',
        description: `Your service analysis fee from ${geneticAnalysisOrder.id} has been refunded, kindly check your account balance.`,
        read: false,
        created_at: await this.dateTimeProxy.new(),
        updated_at: await this.dateTimeProxy.new(),
        deleted_at: null,
        from: 'Debio Network',
        to: geneticAnalysisOrder.customerId,
      };

      const geneticAnalysisOrderLogging: TransactionLoggingDto = {
        address: geneticAnalysisOrder.customerId,
        amount: +geneticAnalysisOrder.prices[0].value,
        created_at: geneticAnalysisOrder.updatedAt,
        currency: geneticAnalysisOrder.currency.toUpperCase(),
        parent_id: BigInt(geneticAnalysisOrderHistory.id),
        ref_number: geneticAnalysisOrder.id,
        transaction_status: 16,
        transaction_type: 3,
      };

      if (!isGeneticAnalysisOrderHasBeenInsert) {
        await this.loggingService.create(geneticAnalysisOrderLogging);
        await this.notificationService.insert(customerNotificationInput)
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
