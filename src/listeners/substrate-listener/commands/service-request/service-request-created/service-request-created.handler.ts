import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceRequestCreatedCommand } from './service-request-created.command';
import { ethers } from 'ethers';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import {
  convertToDbioUnit,
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
  private readonly logger: Logger = new Logger(ServiceRequestCreatedCommand.name);

  constructor(
    private readonly process: ProcessEnvProxy,
    private readonly loggingService: TransactionLoggingService,
    private readonly countryService: CountryService,
    private readonly stateService: StateService,
    private readonly mailerManager: MailerManager,
  ) {}

  async execute(command: ServiceRequestCreatedCommand) {
    const serviceRequest = await command.request;
    const stakingLogging: TransactionLoggingDto = {
      address: serviceRequest.requester_address,
      amount: convertToDbioUnit(serviceRequest.staking_amount),
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
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }

  async _sendEmailNotificationServiceRequestCreated(event) {
    const serviceRequest = await event.data[1].toJSON();

    serviceRequest.country = ethers.utils.toUtf8String(serviceRequest.country);
    serviceRequest.region = ethers.utils.toUtf8String(serviceRequest.region);
    serviceRequest.city = ethers.utils.toUtf8String(serviceRequest.city);
    serviceRequest.stakingAmount =
      Number(serviceRequest.stakingAmount.split(',').join('')) / 10 ** 18;
    serviceRequest.serviceCategory = ethers.utils.toUtf8String(
      serviceRequest.serviceCategory,
    );

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
      country: serviceRequest.country || countryName,
      state: serviceRequest.region || regionName,
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
