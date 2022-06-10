import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { EmailNotificationService } from '../../common/modules/database';
import {
  MailerManager,
  SubstrateService,
  labToLabRegister,
  LabRegister,
  GoogleSecretManagerService,
} from '../../common';
import { queryLabById } from '@debionetwork/polkadot-provider';

@Injectable()
export class MailerService {
  private logger: Logger = new Logger(MailerService.name);
  private isRunning = false;
  constructor(
    private readonly googleSecretManagerService: GoogleSecretManagerService,
    private readonly mailerManager: MailerManager,
    private readonly emailNotificationService: EmailNotificationService,
    private readonly substrateService: SubstrateService,
  ) {}

  @Interval(60 * 60 * 1000)
  async handlePendingLabRegister() {
    try {
      if (this.isRunning) return;
      if (this.substrateService.api === undefined) return;

      this.isRunning = true;
      const labRegisterPending =
        await this.emailNotificationService.getPendingLabRegisterNotification();

      for (const data of labRegisterPending) {
        const contextLab = await queryLabById(
          this.substrateService.api as any,
          data.ref_number,
        );

        const labRegister: LabRegister = await labToLabRegister(
          this.substrateService.api,
          contextLab,
        );

        await this.mailerManager.sendLabRegistrationEmail(
          this.googleSecretManagerService.emails.split(','),
          labRegister,
        );

        await this.emailNotificationService.setEmailNotificationSent(
          labRegister.lab_id,
        );
      }
    } catch (error) {
      this.logger.error(`Email Notification scheduler error: ${error}`);
    } finally {
      this.isRunning = false;
    }
  }
}
