import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CustomerStakingRequestService, MailerManager } from '../../common';

@Injectable()
export class MailerService {
  private logger: Logger = new Logger(MailerService.name);
  constructor(private readonly mailerManager: MailerManager) {}

  // TODO: Mailer must use a scheduler to counterract
  // failed mail requests from the frontend application
  @Cron('0 0 0 1 12 *')
  async handleCron() {
    // Get recipients here
    const recipients: string[] = [];

    for (const recipient of recipients) {
      await this.mailerManager.sendCustomerStakingRequestServiceEmail(
        recipient,
        new CustomerStakingRequestService(),
      );
    }
  }
}
