import { Controller, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
  LabRegister,
  labToLabRegister,
  MailerManager,
} from '../../common/modules/mailer';
import { Response } from 'express';
import {
  EmailNotification,
  EmailNotificationService,
  ProcessEnvProxy,
  SubstrateService,
} from '../../common';
import { queryLabById } from '@debionetwork/polkadot-provider';

@Controller('email')
export class EmailEndpointController {
  constructor(
    private readonly process: ProcessEnvProxy,
    private readonly mailerManager: MailerManager,
    private readonly substrateService: SubstrateService,
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  @Post('registered-lab/:lab_id')
  @ApiParam({ name: 'lab_id' })
  @ApiOperation({
    description: 'send email to Debio Team when lab registered successful.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Sending Email.',
      },
    },
  })
  async sendMailRegisteredLab(
    @Param('lab_id') lab_id: string,
    @Res() response: Response,
  ) {
    let isEmailSent = false;
    const contextLab = await queryLabById(
      this.substrateService.api as any,
      lab_id,
    );

    const labRegister: LabRegister = await labToLabRegister(
      this.substrateService.api,
      contextLab,
    );

    const sentEMail = await this.mailerManager.sendLabRegistrationEmail(
      this.process.env.EMAILS.split(','),
      labRegister,
    );

    const dataInput = new EmailNotification();
    if (sentEMail) {
      isEmailSent = true;
      dataInput.sent_at = new Date();
    }
    dataInput.notification_type = 'LabRegister';
    dataInput.ref_number = lab_id;
    dataInput.is_email_sent = isEmailSent;
    dataInput.created_at = new Date();

    await this.emailNotificationService.insertEmailNotification(dataInput);

    response.status(200).send({
      message: 'Sending Email.',
    });
  }
}
