import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import { CustomerStakingRequestService, MailerManager, SubstrateService, queryLabById, LabRegister, labToLabRegister } from '../../common';

@Injectable()
export class MailerService {
  private logger: Logger = new Logger(MailerService.name);
  constructor(
    private readonly mailerManager: MailerManager,
    private readonly substrateService: SubstrateService,
    ) {}

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

  @Interval(15 * 60 * 1000)
  async handlePendingLabRegister() {
    const labRegisterPending = await this.mailerManager.getPendingLabRegisterNotification()

    labRegisterPending.forEach(async (data) => {
      const contextLab = await queryLabById(this.substrateService.api, labRegisterPending.ref_number);

    const labRegister: LabRegister = await labToLabRegister(
      this.substrateService.api,
      contextLab,
    );

    await this.mailerManager.sendLabRegistrationEmail(
      process.env.EMAILS.split(','),
      labRegister,
    );
    });
  }

}
