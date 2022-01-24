import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailNotification } from './email-notification.entity';

@Injectable()
export class EmailNotificationService {
  constructor(
    @InjectRepository(EmailNotification)
    private readonly emailNotificationRepository: Repository<EmailNotification>,
    ) {}

  async insertEmailNotification(data: EmailNotification) {
    try {
      return this.emailNotificationRepository.save(data)
    } catch (error) {
      return error
    }
  }

  async getPendingLabRegisterNotification() {
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

  async getPendingCustomerRequestServiceNotification() {
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