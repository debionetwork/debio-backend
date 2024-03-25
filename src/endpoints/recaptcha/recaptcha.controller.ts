import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Body, Controller, Post, Res, UseInterceptors } from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';
import { keyList } from '../../common/secrets';
import { SentryInterceptor } from '../../common/interceptors';

@UseInterceptors(SentryInterceptor)
@Controller('recaptcha')
export class RecaptchaController {
  constructor(
    private readonly gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
  ) {}

  @Post()
  async recaptcha(@Body() payload: any, @Res() response: Response) {
    const result = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify' +
        '?secret=' +
        this.gCloudSecretManagerService
          .getSecret('RECAPTCHA_SECRET_KEY')
          .toString() +
        '&response=' +
        payload.response,
    );

    const { data } = result;

    return response.status(200).json(data);
  }
}
