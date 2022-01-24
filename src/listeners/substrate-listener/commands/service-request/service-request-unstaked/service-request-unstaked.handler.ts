import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  convertToDbioUnit,
  DateTimeProxy,
  TransactionLoggingService,
} from '../../../../../common';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import { ServiceRequestUnstakedCommand } from './service-request-unstaked.command';

@Injectable()
@CommandHandler(ServiceRequestUnstakedCommand)
export class ServiceRequestUnstakedHandler
  implements ICommandHandler<ServiceRequestUnstakedCommand>
{
  private readonly logger: Logger = new Logger(
    ServiceRequestUnstakedCommand.name,
  );

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: ServiceRequestUnstakedCommand) {
    const serviceRequest = command.request;

    try {
      const serviceRequestParent =
        await this.loggingService.getLoggingByOrderId(serviceRequest.hash);
      const isServiceRequestHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          serviceRequest.hash,
          8,
        );
      const stakingLogging: TransactionLoggingDto = {
        address: serviceRequest.requester_address,
        amount: convertToDbioUnit(serviceRequest.staking_amount),
        created_at: new Date(this.dateTimeProxy.now()),
        currency: 'DBIO',
        parent_id: BigInt(serviceRequestParent.id),
        ref_number: serviceRequest.hash,
        transaction_status: 8,
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
