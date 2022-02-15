import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceRequestCreatedCommand } from './service-request-created.command';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import {
  MailerManager,
  ProcessEnvProxy,
  TransactionLoggingService,
} from '../../../../../common';
import { CountryService } from '../../../../../endpoints/location/country.service';
import { StateService } from '../../../../../endpoints/location/state.service';

@Injectable()
@CommandHandler(ServiceRequestCreatedCommand)
export class ServiceRequestCreatedHandler
  implements ICommandHandler<ServiceRequestCreatedCommand>
{
  private readonly logger: Logger = new Logger(
    ServiceRequestCreatedCommand.name,
  );

  constructor(
    private readonly process: ProcessEnvProxy,
    private readonly loggingService: TransactionLoggingService,
    private readonly countryService: CountryService,
    private readonly stateService: StateService,
    private readonly mailerManager: MailerManager,
  ) {}

  async execute(command: ServiceRequestCreatedCommand) {
    const serviceRequest = command.request.humanToServiceRequestListenerData();
    const stakingLogging: TransactionLoggingDto = {
      address: serviceRequest.requester_address,
      amount: serviceRequest.staking_amount,
      created_at: serviceRequest.created_at,
      currency: 'DBIO',
      parent_id: BigInt(0),
      ref_number: serviceRequest.hash,
      transaction_status: 7,
      transaction_type: 2,
    };

    try {
      const isServiceRequestHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          serviceRequest.hash,
          7,
        );
      if (!isServiceRequestHasBeenInsert) {
        await this.loggingService.create(stakingLogging);
        await this._sendEmailNotificationServiceRequestCreated(command)
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }

  async _sendEmailNotificationServiceRequestCreated(command: ServiceRequestCreatedCommand) {
    const serviceRequest = await command.request;
    const countryName = await (
      await this.countryService.getByIso2Code(serviceRequest.country)
    ).name;
    const regionName = await (
      await this.stateService.getState(
        serviceRequest.country,
        serviceRequest.region,
      )
    ).name;

    const context = {
      service_name: serviceRequest.service_category,
      public_address: serviceRequest.requester_address,
      country: countryName || serviceRequest.country,
      state: regionName || serviceRequest.region ,
      city: serviceRequest.city,
      amount: serviceRequest.staking_amount,
      currency: 'DBIO',
    };

    await this.mailerManager.sendCustomerStakingRequestServiceEmail(
      this.process.env.EMAILS.split(','),
      context,
    );
  }
}
