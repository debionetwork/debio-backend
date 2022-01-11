import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Lab, LabRegister, LabRegisterCertification, LabRegisterService, labToLabRegister, MailerManager, queryCertificationsByMultipleIds, queryLabById, queryServicesByMultipleIds, sendRewards, Service, SubstrateService } from "../../../../../common";
import { ServiceCreatedCommand } from "./service-created.command";

@Injectable()
@CommandHandler(ServiceCreatedCommand)
export class ServiceCreatedHandler implements ICommandHandler<ServiceCreatedCommand> {
  constructor(
    private readonly substrateService: SubstrateService,
    private readonly mailerManager: MailerManager
  ) {}

  async execute(command: ServiceCreatedCommand) {
    const service: Service = command.services[0].toHuman();
    const lab: Lab = await queryLabById(this.substrateService.api, service.owner_id);

    if (lab.verification_status === 'Unverified' && lab.services.length === 1) {
      // Send email for unverified accounts only (until further notice)
      const labRegister: LabRegister = await labToLabRegister(
        this.substrateService.api,
        lab
      );
      this.mailerManager.sendLabRegistrationEmail(
        process.env.EMAILS.split(','),
        labRegister,
      );
    }
  }
}