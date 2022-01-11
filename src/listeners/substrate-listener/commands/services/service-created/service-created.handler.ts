import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Lab, LabRegister, LabRegisterCertification, LabRegisterService, MailerManager, queryCertificationsByMultipleIds, queryLabById, queryServicesByMultipleIds, sendRewards, Service, SubstrateService } from "../../../../../common";
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
      const labRegister: LabRegister = await this._labToLabRegister(lab);
      this.mailerManager.sendLabRegistrationEmail(
        process.env.EMAILS.split(','),
        labRegister,
      );
    }
  }

  async _getLabRegisterCertification(ids: string[]): Promise<Array<LabRegisterCertification>> {
    const certifications = await queryCertificationsByMultipleIds(
      this.substrateService.api,
      ids,
    );
    const labRegisterCertifications: Array<LabRegisterCertification> =
      new Array<LabRegisterCertification>();

    certifications.forEach((val) => {
      const lrc: LabRegisterCertification = new LabRegisterCertification();
      lrc.title = val.info.title;
      lrc.issuer = val.info.issuer;
      lrc.description = val.info.description;
      lrc.month = val.info.month;
      lrc.year = val.info.year;
      lrc.supporting_document = val.info.supportingDocument;
      labRegisterCertifications.push(lrc);
    });

    return labRegisterCertifications; 
  }

  async _getLabRegisterService(ids: string[]): Promise<Array<LabRegisterService>> {
    const services = await queryServicesByMultipleIds(this.substrateService.api, ids);
    const labRegisterServices: Array<LabRegisterService> =
      new Array<LabRegisterService>();

    services.forEach((val) => {
      const lrs: LabRegisterService = new LabRegisterService();
      lrs.name = val.info.name;
      lrs.category = val.info.category;
      lrs.price = val.price;
      lrs.qc_price = val.qc_price;
      lrs.description = val.info.description;
      lrs.long_description = val.info.longDescription;
      lrs.test_result_sample = val.info.testResultSample;
      lrs.expected_duration.duration = val.info.expectedDuration.duration;
      lrs.expected_duration.duration_type = val.info.expectedDuration.durationType;
      labRegisterServices.push(lrs);
    });

    return labRegisterServices;
  }

  async _labToLabRegister(lab: Lab): Promise<LabRegister> {
    const labRegister = new LabRegister();

    labRegister.email = lab.info.email;
    labRegister.phone_number = lab.info.phoneNumber;
    labRegister.website = lab.info.website;
    labRegister.lab_name = lab.info.name;
    labRegister.country = lab.info.country;
    labRegister.state = lab.info.region;
    labRegister.city = lab.info.city;
    labRegister.address = lab.info.address;
    labRegister.profile_image = lab.info.profileImage;
    labRegister.certifications = await this._getLabRegisterCertification(
      lab.certifications,
    );
    labRegister.services = await this._getLabRegisterService(lab.services);

    return labRegister;
  }
}