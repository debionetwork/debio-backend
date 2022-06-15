import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceRequestStakingAmountExcessRefundedCommand } from './service-request-excess.command';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  DebioNotificationService,
  TransactionLoggingService,
} from '../../../../../common';
import { NotificationDto } from '../../../../../common/modules/debio-notification/dto/notification.dto';

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
    private readonly notificationService: DebioNotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: ServiceRequestStakingAmountExcessRefundedCommand) {
    await this.logger.log('Service Request Staking Amount Excess Refunded!');
    const serviceRequest = command.request;
    const loggingServiceRequest = await this.loggingService.getLoggingByOrderId(
      serviceRequest[1],
    );

    const stakingLogging: TransactionLoggingDto = {
      address: serviceRequest[0].toString(),
      amount: serviceRequest[2].toString(),
      created_at: this.dateTimeProxy.new(),
      currency: 'DBIO',
      parent_id: loggingServiceRequest.id,
      ref_number: serviceRequest[1].toString(),
      transaction_status: 9,
      transaction_type: 2,
    };

    try {
      const isServiceRequestHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          serviceRequest.hash,
          9,
        );
      if (!isServiceRequestHasBeenInsert) {
        await this.loggingService.create(stakingLogging);

        const currDateTime = this.dateTimeProxy.new();

        const notificationInput: NotificationDto = {
          role: 'Customer',
          entity_type: 'ServiceRequest',
          entity: 'ServiceRequestStakingAmountExessRefunded',
          description: `Your over payment staking service request with ID ${serviceRequest[1]} has been refunded.`,
          read: false,
          created_at: currDateTime,
          updated_at: currDateTime,
          deleted_at: null,
          from: null,
          to: serviceRequest.requesterAddress,
        };

        await this.notificationService.insert(notificationInput);
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
