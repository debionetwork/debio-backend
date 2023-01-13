import { Controller, HttpException, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
  geneticAnalystToGARegister,
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
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { keyList } from '../../common/secrets';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Controller('email')
export class EmailEndpointController {
  constructor(
    private readonly substrateService: SubstrateService,
    @InjectQueue('email-sender-queue') private emailSenderQueue: Queue,
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
  async sendMailRegisteredLab(@Param('lab_id') lab_id: string) {
    try {
      const contextLab = await queryLabById(
        this.substrateService.api as any,
        lab_id,
      );

      const labRegister: LabRegister = await labToLabRegister(
        this.substrateService.api,
        contextLab,
      );

      this.emailSenderQueue.add('register-lab', labRegister);

      return {
        message: 'Sending Email.',
      };
    } catch (err) {
      if (err instanceof TypeError) {
        throw new HttpException(
          {
            status: 404,
            error: true,
            message: 'lab id is not found',
          },
          404,
        );
      } else {
        throw new HttpException(
          {
            status: 500,
            error: true,
            message: 'Something went wrong',
          },
          500,
        );
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
      const contextGA = await queryGeneticAnalystByAccountId(
        this.substrateService.api as any,
        genetic_analyst_id,
      );

      const geneticAnalystRegister = await geneticAnalystToGARegister(
        this.substrateService.api as any,
        contextGA,
      );

      this.emailSenderQueue.add('register-ga', geneticAnalystRegister);

      return {
        message: 'Sending Email.',
      };
    } catch (err) {
      if (err instanceof TypeError) {
        throw new HttpException(
          {
            status: 404,
            error: true,
            message: 'genetic analyst id is not found',
          },
          404,
        );
      } else {
        throw new HttpException(
          {
            status: 500,
            error: true,
            message: 'Something went wrong',
          },
          500,
        );
      }
    }
  }
}
