import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import { CustomerStakingRequestService, MailerManager, SubstrateService, queryLabById, LabRegister, labToLabRegister } from '../../common';

@Injectable()
export class MailerService implements OnModuleInit {
  private logger: Logger = new Logger(MailerService.name);
  private isRunning = false;
  constructor(
    private readonly mailerManager: MailerManager,
    private readonly substrateService: SubstrateService,
    ) {}
  
  onModuleInit() {
    console.log('sini');
    
   this.handlePendingLabRegister()
  }
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

  @Interval(10 * 1000)
  async handlePendingLabRegister() {
    console.log('masul');
    
    try {
      if(this.isRunning) return;

      this.isRunning = true;
      const labRegisterPending = await this.mailerManager.getPendingLabRegisterNotification()
      
      console.log('---', labRegisterPending);
      console.log('api',await this.substrateService.api);
      
      labRegisterPending.forEach(async (data) => {
        const contextLab = await queryLabById(this.substrateService.api, data.ref_number);
  
      const labRegister: LabRegister = await labToLabRegister(
        this.substrateService.api,
        contextLab,
      );
      
      await this.mailerManager.sendLabRegistrationEmail(
        process.env.EMAILS.split(','),
        labRegister,
      );
      
      await this.mailerManager.setEmailNotificationSent(labRegister.address)
      });
    } catch (error) {
      this.logger.error(`Email Notification scheduler error: ${error}`)
    } finally {
      this.isRunning = false;
    }
  }

}
