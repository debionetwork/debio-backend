import { Controller, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
  geneticAnalystToGARegister,
  healthProfessionalToHPRegister,
  LabRegister,
  labToLabRegister,
  MailerManager,
} from '../../common/modules/mailer';
import { Response } from 'express';
import {
  EmailNotification,
  EmailNotificationService,
  SubstrateService,
} from '../../common';
import {
  queryGeneticAnalystByAccountId,
  queryLabById,
} from '@debionetwork/polkadot-provider';
import { queryHealthProfessionalById } from '@common/modules/polkadot-provider/query/health-professional';
import { config } from '../../config';

@Controller('email')
export class EmailEndpointController {
  constructor(
    private readonly mailerManager: MailerManager,
    private readonly substrateService: SubstrateService,
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  /* A function that takes two arguments and returns a list with the first argument as the head and the
  second argument as the tail. */
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
    try {
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
        config.EMAILS.toString().split(','),
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
    } catch (err) {
      if (err instanceof TypeError) {
        response.status(404).send({
          error: true,
          message: 'lab id is not found',
        });
      } else {
        response.status(500).send({
          error: true,
          message: 'Something went wrong',
        });
      }
    }
  }

  @Post('registered-genetic-analyst/:genetic_analyst_id')
  @ApiParam({ name: 'genetic_analyst_id' })
  async sendMailRegisterGeneticAnalyst(
    @Param('genetic_analyst_id') genetic_analyst_id: string,
    @Res() response: Response,
  ) {
    try {
      let isEmailSent = false;
      const contextGA = await queryGeneticAnalystByAccountId(
        this.substrateService.api as any,
        genetic_analyst_id,
      );

      const geneticAnalystRegister = await geneticAnalystToGARegister(
        this.substrateService.api as any,
        contextGA,
      );

      const sentEMail =
        await this.mailerManager.sendGeneticAnalystRegistrationEmail(
          config.EMAILS.toString().split(','),
          geneticAnalystRegister,
        );

      const dataInput = new EmailNotification();
      if (sentEMail) {
        isEmailSent = true;
        dataInput.sent_at = new Date();
      }
      dataInput.notification_type = 'GeneticAnalystRegister';
      dataInput.ref_number = genetic_analyst_id;
      dataInput.is_email_sent = isEmailSent;
      dataInput.created_at = new Date();

      await this.emailNotificationService.insertEmailNotification(dataInput);

      response.status(200).send({
        message: 'Sending Email.',
      });
    } catch (err) {
      if (err instanceof TypeError) {
        response.status(404).send({
          error: true,
          message: 'genetic analyst id is not found',
        });
      } else {
        response.status(500).send({
          error: true,
          message: 'Something went wrong',
        });
      }
    }
  }

  @Post('registered-health-professional/:health_professional_id')
  @ApiParam({ name: 'health_professional_id' })
  async sendMailRegisterHealthProfessional(
    @Param('health_professional_id') health_professional_id: string,
    @Res() response: Response,
  ) {
    try {
      let isEmailSent = false;
      const contextHP = await queryHealthProfessionalById(
        this.substrateService.api as any,
        health_professional_id,
      );

      const healthProfessionalRegister = await healthProfessionalToHPRegister(
        this.substrateService.api as any,
        contextHP,
      );

      const sentEMail = await this.mailerManager.sendHealthProfessionalEmail(
        config.EMAILS.toString().split(','),
        healthProfessionalRegister,
      );

      const dataInput = new EmailNotification();
      if (sentEMail) {
        isEmailSent = true;
        dataInput.sent_at = new Date();
      }
      dataInput.notification_type = 'HealthProfessionalRegister';
      dataInput.ref_number = health_professional_id;
      dataInput.is_email_sent = isEmailSent;
      dataInput.created_at = new Date();

      await this.emailNotificationService.insertEmailNotification(dataInput);

      response.status(200).send({
        message: 'Sending Email.',
      });
    } catch (err) {
      if (err instanceof TypeError) {
        response.status(404).send({
          error: true,
          message: 'health professional id is not found',
        });
      } else {
        response.status(500).send({
          error: true,
          message: 'Something went wrong',
        });
      }
    }
  }
}
