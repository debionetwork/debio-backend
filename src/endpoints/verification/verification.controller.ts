import {
  Body,
  Controller,
  Headers,
  HttpException,
  Post,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { SentryInterceptor } from '../../common';
import { VerificationService } from './verification.service';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives';
import { HealthProfessionalRegisterDTO } from './dto/health-professional.dto';
import { config } from '../../../config';

@UseInterceptors(SentryInterceptor)
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('/lab')
  @ApiQuery({ name: 'account_id' })
  @ApiQuery({
    name: 'verification_status',
    enum: ['Unverified', 'Verified', 'Rejected', 'Revoked'],
  })
  @ApiOperation({ description: 'verification lab.' })
  async updateStatusLab(
    @Headers('debio-api-key') debioApiKey: string,
    @Res() response: Response,
    @Query('account_id') account_id: string,
    @Query('verification_status') verification_status: string,
  ) {
    try {
      if (debioApiKey != config.DEBIO_API_KEY.toString()) {
        return response.status(401).send('debio-api-key header is required');
      }
      await this.verificationService.verificationLab(
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
  @ApiOperation({ description: 'verification genetic analyst.' })
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
      if (debioApiKey != config.DEBIO_API_KEY.toString()) {
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

  @Post('/health-professional')
  @ApiBody({ type: HealthProfessionalRegisterDTO })
  @ApiOperation({ description: 'verification health professional.' })
  async updateStatusHealthProfessional(
    @Headers('debio-api-key') debioApiKey: string,
    @Res() response: Response,
    @Body() data: HealthProfessionalRegisterDTO,
  ) {
    if (debioApiKey != config.DEBIO_API_KEY.toString()) {
      throw new HttpException(
        {
          status: 401,
          message: 'debio-api-key header is required',
        },
        401,
      );
    }

    await this.verificationService.verificationHealthProfessional(
      data.account_id,
      data.hex_account_id,
      data.verification_status as VerificationStatus,
      data.selected_user_id,
      data.timeline_id,
    );

    return response
      .status(200)
      .send(
        `Health Professional ${data.account_id} is ${data.verification_status}`,
      );
  }
}
