import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { CountryService } from 'src/location/country.service';
import { StateService } from 'src/location/state.service';
import { 
  CustomerStakingRequestService, 
  LabRegister 
} from './models';

@Injectable()
export class MailerManager {
  constructor(
    private readonly mailerService: MailerService,
    private readonly countryService: CountryService,
    private readonly stateService: StateService
    ) {}

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
    let files: any[];
    context.certifications.forEach((val, idx) => {
      files.push({
        filename: `Certifications Supporting Document ${idx + 1}`,
        path: val.supporting_document,
      });
    });
    context.services.forEach((val, idx) => {
      files.push({
        filename: `Services Supporting Document ${idx + 1}`,
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
      },
      attachments: files,
    });
  }
}
