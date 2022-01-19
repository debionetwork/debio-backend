import { Controller, Param, Post, Res } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import {
  LabRegister,
  labToLabRegister,
  MailerManager,
} from '../../common/modules/mailer';
import { Response } from 'express';
import { queryLabById, SubstrateService } from '../../common';
import { EmailNotificationDatabase } from '../../common/modules/mailer/models'

@Controller('email')
export class EmailEndpointController {
  constructor(
    private readonly mailerManager: MailerManager,
    private readonly substrateService: SubstrateService,
  ) {}

  @Post('registered-lab/:lab_id')
  @ApiParam({ name: 'lab_id' })
  async sendMailRegisteredLab(
    @Param('lab_id') lab_id: string,
    @Res() response: Response,
  ) {
    let isEmailSent = false
    const contextLab = await queryLabById(this.substrateService.api, lab_id);

    const labRegister: LabRegister = await labToLabRegister(
      this.substrateService.api,
      contextLab,
    );

    const sentEMail = await this.mailerManager.sendLabRegistrationEmail(
      process.env.EMAILS.split(','),
      labRegister,
    );

    const dataInput = new EmailNotificationDatabase()
    if(sentEMail){
      isEmailSent = true
      dataInput.sent_at = new Date()
    }
    dataInput.notification_type = 'LabRegister'
    dataInput.ref_number = lab_id
    dataInput.is_email_sent = isEmailSent
    dataInput.created_at = new Date()
    
    await this.mailerManager.insertEmailNotification(dataInput)

    response.status(200).send({
      message: 'Sending Email.',
    });
  }
}
