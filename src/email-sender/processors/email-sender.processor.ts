import {
  EmailNotification,
  EmailNotificationService,
  GeneticAnalystRegister,
  LabRegister,
  MailerManager,
} from '@common/modules';
import { keyList } from '@common/secrets';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('email-sender-queue')
export class EmailSenderProcessor {
  constructor(
    private readonly gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
    private readonly mailerManager: MailerManager,
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  @Process('register-lab')
  async handleRegisterLab(job: Job<LabRegister>) {
    let isEmailSent = false;
    const labRegister = job.data;
    const sentEMail = await this.mailerManager.sendLabRegistrationEmail(
      this.gCloudSecretManagerService.getSecret('EMAILS').toString().split(','),
      labRegister,
    );

    const dataInput = new EmailNotification();
    if (sentEMail) {
      isEmailSent = true;
      dataInput.sent_at = new Date();
    }
    dataInput.notification_type = 'LabRegister';
    dataInput.ref_number = labRegister.lab_id;
    dataInput.is_email_sent = isEmailSent;
    dataInput.created_at = new Date();

    await this.emailNotificationService.insertEmailNotification(dataInput);
  }

  @Process('register-ga')
  async handleRegisterGA(job: Job<GeneticAnalystRegister>) {
    const geneticAnalystRegister = job.data;
    let isEmailSent = false;
    const sentEMail =
      await this.mailerManager.sendGeneticAnalystRegistrationEmail(
        this.gCloudSecretManagerService
          .getSecret('EMAILS')
          .toString()
          .split(','),
        geneticAnalystRegister,
      );

    const dataInput = new EmailNotification();
    if (sentEMail) {
      isEmailSent = true;
      dataInput.sent_at = new Date();
    }
    dataInput.notification_type = 'GeneticAnalystRegister';
    dataInput.ref_number = geneticAnalystRegister.genetic_analyst_id;
    dataInput.is_email_sent = isEmailSent;
    dataInput.created_at = new Date();

    await this.emailNotificationService.insertEmailNotification(dataInput);
  }
}
