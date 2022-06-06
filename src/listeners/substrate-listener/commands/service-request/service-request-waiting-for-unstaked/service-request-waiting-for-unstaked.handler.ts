import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DateTimeProxy,
  TransactionLoggingService,
} from '../../../../../common';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import { ServiceRequestWaitingForUnstakedCommand } from './service-request-waiting-for-unstaked.command';

@Injectable()
@CommandHandler(ServiceRequestWaitingForUnstakedCommand)
export class ServiceRequestWaitingForUnstakedHandler
  implements ICommandHandler<ServiceRequestWaitingForUnstakedCommand>
{
  private readonly logger: Logger = new Logger(
    ServiceRequestWaitingForUnstakedCommand.name,
  );

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: ServiceRequestWaitingForUnstakedCommand) {
    const serviceRequest = command.request.normalize();
    await this.logger.log(`Service Request Waiting For Unstaked With Hash: ${serviceRequest.hash}!`);

    try {
      const serviceRequestParent =
        await this.loggingService.getLoggingByOrderId(serviceRequest.hash);
      const isServiceRequestHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          serviceRequest.hash,
          11,
        );
      const stakingLogging: TransactionLoggingDto = {
        address: serviceRequest.requesterAddress,
        amount: 0,
        created_at: this.dateTimeProxy.new(),
        currency: 'DBIO',
        parent_id: BigInt(serviceRequestParent.id),
        ref_number: serviceRequest.hash,
        transaction_status: 11,
        transaction_type: 2,
      };

      if (!isServiceRequestHasBeenInsert) {
        await this.loggingService.create(stakingLogging);
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
