import {
  Controller,
  Headers,
  Post,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { SentryInterceptor, ProcessEnvProxy } from '../../common';
import { VerificationService } from './verification.service';

@UseInterceptors(SentryInterceptor)
@Controller('verification')
export class VerificationController {
  constructor(
    private readonly processEnvProxy: ProcessEnvProxy,
    private readonly verificationService: VerificationService,
  ) {}

  @Post('/lab')
  @ApiQuery({ name: 'account_id' })
  @ApiQuery({
    name: 'verification_status',
    enum: ['Unverified', 'Verified', 'Rejected', 'Revoked'],
  })
  async updateStatusLab(
    @Headers('debio-api-key') debioApiKey: string,
    @Res() response: Response,
    @Query('account_id') account_id: string,
    @Query('verification_status') verification_status: string,
  ) {
    try {
      if (debioApiKey != this.processEnvProxy.env.DEBIO_API_KEY) {
        return response.status(401).send('debio-api-key header is required');
      }
      await this.verificationService.vericationLab(
        account_id,
        verification_status,
      );
      let isVerified = '';
      if (verification_status === 'Verified') {
        isVerified = ', and Got Reward 2 DBIO';
      }
      return response
        .status(200)
        .send(`Lab ${account_id} ${verification_status}${isVerified}`);
    } catch (error) {
      return response.status(500).send(error);
    }
  }

  @Post('/genetic-analysts')
  @ApiQuery({ name: 'account_id' })
  @ApiQuery({
    name: 'verification_status',
    enum: ['Unverified', 'Verified', 'Rejected', 'Revoked'],
  })
  async updateStatusGeneticAnalyst(
    @Headers('debio-api-key') debioApiKey: string,
    @Res() response: Response,
    @Query('account_id') account_id: string,
    @Query('verification_status') verification_status: string,
  ) {
    try {
      if (debioApiKey != this.processEnvProxy.env.DEBIO_API_KEY) {
        return response.status(401).send('debio-api-key header is required');
      }
      await this.verificationService.verificationGeneticAnalyst(
        account_id,
        verification_status,
      );

      return response
        .status(200)
        .send(`Genetic Analyst ${account_id} is ${verification_status}`);
    } catch (error) {
      return response.status(500).send(error);
    }
  }
}
