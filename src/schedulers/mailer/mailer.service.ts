import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { EmailNotificationService } from 'src/common/modules/database';
import { MailerManager, SubstrateService, queryLabById, LabRegister, labToLabRegister } from '../../common';

@Injectable()
export class MailerService implements OnModuleInit {
  private logger: Logger = new Logger(MailerService.name);
  private isRunning = false;
  constructor(
    private readonly mailerManager: MailerManager,
    private readonly emailNotificationService: EmailNotificationService,
    private readonly substrateService: SubstrateService,
  ) {}
  
  onModuleInit() {
   this.handlePendingLabRegister()
  }

  @Interval(10 * 1000)
  async handlePendingLabRegister() {
    try {
      if(this.isRunning) return;

      this.isRunning = true;
      const labRegisterPending = await this.emailNotificationService.getPendingLabRegisterNotification()
      
      console.log('---', labRegisterPending);
      console.log('api', this.substrateService.api);
      
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
      
      await this.emailNotificationService.setEmailNotificationSent(labRegister.address)
      });
    } catch (error) {
      this.logger.error(`Email Notification scheduler error: ${error}`)
    } finally {
      this.isRunning = false;
    }
  }

}
