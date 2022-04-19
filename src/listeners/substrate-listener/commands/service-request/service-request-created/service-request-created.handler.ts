import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceRequestCreatedCommand } from './service-request-created.command';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  MailerManager,
  ProcessEnvProxy,
  TransactionLoggingService,
} from '../../../../../common';
import { CountryService } from '../../../../../endpoints/location/country.service';
import { StateService } from '../../../../../endpoints/location/state.service';
import { NotificationService } from '../../../../../endpoints/notification/notification.service';
import { NotificationDto } from 'src/endpoints/notification/dto/notification.dto';

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
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: ServiceRequestCreatedCommand) {
    const serviceRequest = command.request.normalize();
    const stakingLogging: TransactionLoggingDto = {
      address: serviceRequest.requesterAddress,
      amount: serviceRequest.stakingAmount,
      created_at: serviceRequest.createdAt,
      currency: 'DBIO',
      parent_id: BigInt(0),
      ref_number: serviceRequest.hash,
      transaction_status: 7,
      transaction_type: 2,
    };

    const notificationInput: NotificationDto = {
      role: 'Customer',
      entity_type: 'ServiceRequest',
      entity: 'ServiceRequestCreated',
      description: `Congrats! Your requested service with staking ID ${serviceRequest.hash} has been submitted.`,
      read: false,
      created_at: await this.dateTimeProxy.new(),
      updated_at: await this.dateTimeProxy.new(),
      deleted_at: null,
      from: null,
      to: serviceRequest.requesterAddress,
    };

    try {
      const isServiceRequestHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          serviceRequest.hash,
          7,
        );
      if (!isServiceRequestHasBeenInsert) {
        await this.loggingService.create(stakingLogging);
        await this.notificationService.insert(notificationInput);
        await this._sendEmailNotificationServiceRequestCreated(command);
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }

  async _sendEmailNotificationServiceRequestCreated(
    command: ServiceRequestCreatedCommand,
  ) {
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
      service_name: serviceRequest.serviceCategory,
      public_address: serviceRequest.requesterAddress,
      country: countryName || serviceRequest.country,
      state: regionName || serviceRequest.region,
      city: serviceRequest.city,
      amount: serviceRequest.stakingAmount,
      currency: 'DBIO',
    };

    await this.mailerManager.sendCustomerStakingRequestServiceEmail(
      this.process.env.EMAILS.split(','),
      context,
    );
  }
}
