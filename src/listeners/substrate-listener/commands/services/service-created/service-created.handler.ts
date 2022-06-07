import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  LabRegister,
  labToLabRegister,
  MailerManager,
  ProcessEnvProxy,
  SubstrateService,
} from '../../../../../common';
import { Lab, queryLabById, Service } from '@debionetwork/polkadot-provider';
import { ServiceCreatedCommand } from './service-created.command';

@Injectable()
@CommandHandler(ServiceCreatedCommand)
export class ServiceCreatedHandler
  implements ICommandHandler<ServiceCreatedCommand>
{
  private readonly logger: Logger = new Logger(ServiceCreatedCommand.name);
  constructor(
    private readonly process: ProcessEnvProxy,
    private readonly substrateService: SubstrateService,
    private readonly mailerManager: MailerManager,
  ) {}

  async execute(command: ServiceCreatedCommand) {
    const service: Service = command.services;
    await this.logger.log(
      `Lab ID: ${service.ownerId} Service Created With ID: ${service.id}`,
    );
    const lab: Lab = await queryLabById(
      this.substrateService.api as any,
      service.ownerId,
    );

    if (lab.verificationStatus === 'Unverified' && lab.services.length === 1) {
      // Send email for unverified accounts only (until further notice)
      const labRegister: LabRegister = await labToLabRegister(
        this.substrateService.api,
        lab,
      );
      this.mailerManager.sendLabRegistrationEmail(
        this.process.env.EMAILS.split(','),
        labRegister,
      );
    }
  }
}
