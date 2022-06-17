import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  NotificationService,
  TransactionLoggingService,
} from '../../../../../common';
import { GeneticAnalysisOrderFulfilledCommand } from './genetic-analysis-order-fulfilled.command';
import { NotificationDto } from '../../../../../common/modules/notification/dto/notification.dto';

@Injectable()
@CommandHandler(GeneticAnalysisOrderFulfilledCommand)
export class GeneticAnalysisOrderFulfilledHandler
  implements ICommandHandler<GeneticAnalysisOrderFulfilledCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalysisOrderFulfilledCommand.name,
  );
  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: GeneticAnalysisOrderFulfilledCommand) {
    const geneticAnalysisOrder = command.geneticAnalysisOrders.normalize();
    await this.logger.log(
      `Genetic Analysis Order Fulfilled! With GA Order ID: ${geneticAnalysisOrder.id}`,
    );

    try {
      const isGeneticAnalysisOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalysisOrder.id,
          15,
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
        transaction_status: 15,
        transaction_type: 3,
      };

      const serviceChargeLogging: TransactionLoggingDto = {
        address: geneticAnalysisOrder.customerId,
        amount: (+geneticAnalysisOrder.prices[0].value * 5) / 100, //5% prices
        created_at: geneticAnalysisOrder.updatedAt,
        currency: geneticAnalysisOrder.currency.toUpperCase(),
        parent_id: BigInt(geneticAnalysisOrderHistory.id),
        ref_number: geneticAnalysisOrder.id,
        transaction_status: 28,
        transaction_type: 3,
      };

      if (!isGeneticAnalysisOrderHasBeenInsert) {
        await this.loggingService.create(geneticAnalysisOrderLogging);
        await this.loggingService.create(serviceChargeLogging);

        const currDate = this.dateTimeProxy.new();

        const receivePaymentNotification: NotificationDto = {
          role: 'GA',
          entity_type: 'Genetic Analysis Order',
          entity: 'Order Fulfilled',
          description: `You've received ${+geneticAnalysisOrder.prices[0]
            .value} DBIO for completing the requested analysis for ${
            geneticAnalysisOrder.geneticAnalysisTrackingId
          }.`,
          read: false,
          created_at: currDate,
          updated_at: currDate,
          deleted_at: null,
          from: 'Debio Network',
          to: geneticAnalysisOrder.sellerId,
        };

        await this.notificationService.insert(receivePaymentNotification);
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
