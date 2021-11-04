import { ApiPromise } from "@polkadot/api";
import { MailerManager } from "src/common/mailer/mailer.manager";
import { LabRegisterCertification } from "src/common/mailer/models/lab-register.model/certification";
import { LabRegister } from "src/common/mailer/models/lab-register.model/lab-register.model";
import { LabRegisterService } from "src/common/mailer/models/lab-register.model/service";
import { Lab } from "src/common/polkadot-provider/models/labs";
import { Service } from "src/common/polkadot-provider/models/services";
import { queryCertificationsByMultipleIds, queryLabById } from "src/common/polkadot-provider/query/labs";
import { queryServicesByMultipleIds } from "src/common/polkadot-provider/query/services";

export class ServiceEventHandler {
  constructor(
    private api: ApiPromise,
    private mailerManager: MailerManager
  ) {}
  
  handle(event) {
    switch (event.method) {
      case 'ServiceCreated':
        this._onServiceCreated(event);
        break;
    }
  }

  async _getLabRegisterCertification(ids: string[]): Promise< Array<LabRegisterCertification>>{
    const certifications = await queryCertificationsByMultipleIds(this.api, ids);
    const labRegisterCertifications: Array<LabRegisterCertification> = new Array<LabRegisterCertification>();
    certifications.forEach(val => {
      const lrc: LabRegisterCertification = new LabRegisterCertification();
      lrc.title = val.info.title;
      lrc.issuer = val.info.issuer;
      lrc.description = val.info.description;
      lrc.month = val.info.month;
      lrc.year = val.info.year;
      lrc.supporting_document = val.info.supporting_document;
      labRegisterCertifications.push(lrc);
    });
    return labRegisterCertifications;
  }

  async _getLabRegisterService(ids: string[]): Promise<Array<LabRegisterService>>{
    const services = await queryServicesByMultipleIds(this.api, ids);
    const labRegisterServices: Array<LabRegisterService> = new Array<LabRegisterService>();
    services.forEach(val => {
      const lrs: LabRegisterService = new LabRegisterService();
      lrs.name = val.info.name;
      lrs.category = val.info.category;
      lrs.price = val.price;
      lrs.qc_price = val.qc_price;
      lrs.description = val.info.description;
      lrs.long_description = val.info.long_description;
      lrs.supporting_document = val.info.test_result_sample;
      lrs.test_result_sample = val.info.test_result_sample;
      lrs.expected_duration.duration = val.info.expected_duration.duration;
      lrs.expected_duration.duration_type = val.info.expected_duration.duration_type;
      labRegisterServices.push(lrs);
    });
    return labRegisterServices;
  }

  async _labToLabRegister(lab: Lab): Promise<LabRegister> {
    let labRegister = new LabRegister();

    labRegister.email = lab.info.email;
    labRegister.phone_number = lab.info.phone_number;
    labRegister.website = lab.info.website;
    labRegister.lab_name = lab.info.name;
    labRegister.country = lab.info.country;
    labRegister.state = lab.info.region;
    labRegister.city = lab.info.city;
    labRegister.address = lab.info.address;
    labRegister.profile_image = lab.info.profile_image;
    labRegister.certifications = await this._getLabRegisterCertification(lab.certifications);
    labRegister.services = await this._getLabRegisterService(lab.services);

    return labRegister;
  }

  async _onServiceCreated(event) {
    const service: Service = event.data[0].toHuman();
    console.log(service);
    const lab: Lab = await queryLabById(this.api, service.owner_id);
    if (lab.verification_status === "Unverified" && lab.services.length === 1) { // Send email for unverified accounts only (until further notice)
      console.log("in");
      const labRegister: LabRegister = await this._labToLabRegister(lab);
      this.mailerManager.sendLabRegistrationEmail(
        process.env.EMAILS.split(','),
        labRegister
      );
    }
  }
}