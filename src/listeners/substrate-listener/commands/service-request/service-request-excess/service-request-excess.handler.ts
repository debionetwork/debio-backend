import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceRequestStakingAmountExcessRefundedCommand } from './service-request-excess.command';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  NotificationService,
  TransactionLoggingService,
} from '../../../../../common';
import { NotificationDto } from '../../../../../common/modules/notification/dto/notification.dto';

@Injectable()
@CommandHandler(ServiceRequestStakingAmountExcessRefundedCommand)
export class ServiceRequestStakingAmountExcessRefunded
  implements ICommandHandler<ServiceRequestStakingAmountExcessRefundedCommand>
{
  private readonly logger: Logger = new Logger(
    ServiceRequestStakingAmountExcessRefundedCommand.name,
  );

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: ServiceRequestStakingAmountExcessRefundedCommand) {
    await this.logger.log('Service Request Staking Amount Excess Refunded!');
    const { requesterId, requestId, additionalStakingAmount } = command;
    const loggingServiceRequest = await this.loggingService.getLoggingByOrderId(
      requestId,
    );

    const stakingLogging: TransactionLoggingDto = {
      address: requesterId.toString(),
      amount: Number(additionalStakingAmount),
      created_at: this.dateTimeProxy.new(),
      currency: 'DBIO',
      parent_id: loggingServiceRequest.id,
      ref_number: requestId.toString(),
      transaction_status: 9,
      transaction_type: 2,
    };

    try {
      const isServiceRequestHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(requestId, 9);
      if (!isServiceRequestHasBeenInsert) {
        await this.loggingService.create(stakingLogging);

        const currDateTime = this.dateTimeProxy.new();

        const notificationInput: NotificationDto = {
          role: 'Customer',
          entity_type: 'ServiceRequest',
          entity: 'ServiceRequestStakingAmountExessRefunded',
          description: `Your over payment staking service request with ID ${requestId} has been refunded.`,
          read: false,
          created_at: currDateTime,
          updated_at: currDateTime,
          deleted_at: null,
          from: 'Debio Network',
          to: requesterId,
        };

        await this.notificationService.insert(notificationInput);
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
