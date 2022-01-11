import { Controller, Param, Post, Res } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import {
  LabRegister,
  labToLabRegister,
  MailerManager,
} from '../../common/modules/mailer';
import { Response } from 'express';
import { queryLabById, SubstrateService } from '../../common';

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
    const contextLab = await queryLabById(this.substrateService.api, lab_id);

    const labRegister: LabRegister = await labToLabRegister(
      this.substrateService.api,
      contextLab,
    );

    await this.mailerManager.sendLabRegistrationEmail(
      process.env.EMAILS.split(','),
      labRegister,
    );
    response.status(200).send({
      message: 'Sending Email.',
    });
  }
}
