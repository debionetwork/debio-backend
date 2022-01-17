import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailNotificationDto } from './dto/email-notification.dto';
import { CustomerStakingRequestService, LabRegister, EmailNotification } from './models';

@Injectable()
export class MailerManager {
  constructor(
    private readonly mailerService: MailerService,
    @InjectRepository(EmailNotification)
    private readonly emailNotificationRepository: Repository<EmailNotification>,
    ) {}

  async sendCustomerStakingRequestServiceEmail(
    to: string | string[],
    context: CustomerStakingRequestService,
  ) {
    this.mailerService.sendMail({
      to: to,
      subject: `New Service Request - ${context.service_name} - ${context.city}, ${context.state}, ${context.country}`,
      template: './customer-staking-request-service',
      context: context,
    });
  }

  async sendLabRegistrationEmail(to: string | string[], context: LabRegister) {
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
        certifications: context.certifications,
        services: context.services,
      },
      attachments: files,
    });
  }

  async insertEmailNotification(data: EmailNotificationDto) {
    try {
      return this.emailNotificationRepository.save(data)
    } catch (error) {
      return error
    }
  }

  async getPendingLabRegisterNotification(ref_num) {
    try {
      return this.emailNotificationRepository.find({
        where: {
          is_email_sent: false,
          notification_type: 'LabRegister'
        },
      });
    } catch (error) {
      return error;
    }
  }

  async getPendingCustomerRequestServiceNotification(ref_num) {
    try {
      return this.emailNotificationRepository.find({
        where: {
          is_email_sent: false,
          notification_type: 'Customer Staking Request Service'
        },
      });
    } catch (error) {
      return error;
    }
  }

  async setEmailNotificationSent(ref_number) {
    try {
      return this.emailNotificationRepository.update(
        { ref_number },
        { 
          sent_at: new Date(),
          is_email_sent: true,
        })
    } catch (error) {
      return error;
    }
  }
}
