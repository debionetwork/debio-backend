import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  TransactionLoggingService,
} from '../../../../../common';
import { GeneticAnalysisOrderRefundedCommand } from './genetic-analysis-order-refunded.command';
import { NotificationDto } from '../../../../../endpoints/notification/dto/notification.dto';
import { NotificationService } from '../../../../../endpoints/notification/notification.service';
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
    const geneticAnalysisOrder = command.geneticAnalysisOrders.normalize();
    await this.logger.log(
      `Genetic Analysis Order Refunded With GA Order ID: ${geneticAnalysisOrder.id}!`,
    );

    const notificationInput: NotificationDto = {
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
    try {
      const isGeneticAnalysisOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalysisOrder.id,
          16,
        );
      const geneticAnalysisOrderHistory =
        await this.loggingService.getLoggingByOrderId(geneticAnalysisOrder.id);

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
      }
      await this.notificationService.insert(notificationInput);
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
