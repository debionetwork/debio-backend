import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { CustomerStakingRequestService, LabRegister } from './models';
require('dotenv').config(); // eslint-disable-line

@Injectable()
export class MailerManager {
  private readonly _logger: Logger = new Logger(MailerManager.name);
  constructor(
    private readonly mailerService: MailerService,
    private readonly gCloudSecretManagerService: GCloudSecretManagerService,
  ) {}

  async sendCustomerStakingRequestServiceEmail(
    to: string | string[],
    context: CustomerStakingRequestService,
  ) {
    let subject = `New Service Request - ${context.service_name} - ${context.city}, ${context.state}, ${context.country}`;
    if (
      this.gCloudSecretManagerService.getSecret('POSTGRES_HOST') == 'localhost'
    ) {
      subject = `Testing New Service Request Email`;
    }
    this.mailerService.sendMail({
      to: to,
      subject: subject,
      template: 'customer-staking-request-service',
      context: context,
    });
  }

  async sendLabRegistrationEmail(to: string | string[], context: LabRegister) {
    let subject = `New Lab Register – ${context.lab_name} - ${context.city}, ${context.state}, ${context.country}`;
    if (
      this.gCloudSecretManagerService.getSecret('POSTGRES_HOST') == 'localhost'
    ) {
      subject = `Testing New Lab Register Email`;
    }
    const files: any[] = [];
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

    try {
      this.mailerService.sendMail({
        to: to,
        subject: subject,
        template: 'lab-register',
        context: {
          profile_image: context.profile_image,
          email: context.email,
          lab_name: context.lab_name,
          phone_number: context.phone_number,
          country: context.country,
          state: context.state,
          city: context.city,
          address: context.address,
          certifications: context.certifications,
          services: context.services,
        },
        attachments: files,
      });
      return true;
    } catch (error) {
      await this._logger.log(`Send Email Failed: ${error}`);
    }
  }
}
