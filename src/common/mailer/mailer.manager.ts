import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { CountryService } from 'src/location/country.service';
import { StateService } from 'src/location/state.service';
import { 
  CustomerStakingRequestService, 
  LabRegister,
  LabRegisterCertification,
  LabRegisterService,
} from './models';
import {
  Lab,
  queryCertificationsByMultipleIds,
  queryServicesByMultipleIds
} from'../polkadot-provider'
@Injectable()
export class MailerManager implements OnModuleInit {
  private api: ApiPromise
  constructor(
    private readonly mailerService: MailerService,
    private readonly countryService: CountryService,
    private readonly stateService: StateService,
    ) {}

  async onModuleInit(){
    const wsProvider = new WsProvider(process.env.SUBSTRATE_URL)
    this.api = await ApiPromise.create({
      provider: wsProvider
    })
  }

  async sendCustomerStakingRequestServiceEmail(
    to: string | string[],
    context: CustomerStakingRequestService,
  ) {
    const countryName = await (await this.countryService.getByIso2Code(context.country)).name
    const regionName = await (await this.stateService.getState(
      context.country,
      context.state
      )).name
      
    context.country = countryName || context.country
    context.state = regionName || context.state
    this.mailerService.sendMail({
      to: to,
      subject: `New Service Request - ${context.service_name} - ${context.city}, ${context.state}, ${context.country}`,
      template: './customer-staking-request-service',
      context: context,
    });
  }

  async sendLabRegistrationEmail(to: string | string[], context: LabRegister) {
    let files = []
    context.certifications.forEach((val, idx) => {
      files.push({
        filename: `${val.title}.pdf`,
        path: val.supporting_document,
      });
    });

    this.mailerService.sendMail({
      to: to,
      subject: `New Lab Register – ${context.lab_name} - ${context.city}, ${context.state}, ${context.country}`,
      template: './lab-register',
      context: {
        profile_image: context.profile_image,
        email: context.email,
        lab_name: context.lab_name,
        phone_number: context.phone_number,
        country: context.country,
        state: context.state,
        city: context.city,
        address: context.address,
        services: context.services,
        certifications: context.certifications
      },
      attachments: files,
    });
  }

  async getLabRegisterCertification(
    ids: string[],
  ): Promise<Array<LabRegisterCertification>> {
    const certifications = await queryCertificationsByMultipleIds(
      this.api,
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

  async getLabRegisterService(
    ids: string[],
  ): Promise<Array<LabRegisterService>> {
    const services = await queryServicesByMultipleIds(this.api, ids);
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
      lrs.expected_duration = val.info.expectedDuration;
      labRegisterServices.push(lrs);

    });
    return labRegisterServices;
  }

  async labToLabRegister(lab: Lab): Promise<LabRegister> {
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
    labRegister.services = await this.getLabRegisterService(lab.services);
    labRegister.certifications = await this.getLabRegisterCertification(
      lab.certifications,
    );

    return labRegister;
  }
}
